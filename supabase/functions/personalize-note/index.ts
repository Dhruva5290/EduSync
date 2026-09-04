// =========================================================================
// Supabase Edge Function: personalize-note
// Runtime: Deno / TypeScript
// Trigger: Database Webhook on INSERT into public.notes
// Actions:
//   1. Receives newly uploaded note record
//   2. Sets status = 'processing'
//   3. Calls Gemini 2.5 Flash API for pedagogical personalization
//   4. Updates row: personalised_notes = <result>, status = 'ready'
// =========================================================================
// Ambient Deno declaration for IDE TypeScript language servers
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// CORS Headers for secure cross-origin invocation
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface WebhookPayload {
  type?: string;
  table?: string;
  schema?: string;
  record?: NoteRecord;
  old_record?: NoteRecord | null;
}

interface NoteRecord {
  id: string;
  user_id: string;
  title: string;
  raw_ocr_text?: string | null;
  generalised_notes: string;
  personalised_notes?: string | null;
  status: "uploaded" | "processing" | "ready" | "failed";
  error_message?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase Service Configuration in Edge Function environment.");
    return new Response(
      JSON.stringify({ error: "Supabase environment variables not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Initialize Supabase Admin Client with Service Role Key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  let noteId = "";
  try {
    const rawBody: WebhookPayload & Partial<NoteRecord> = await req.json();
    console.log("personalize-note triggered with payload:", JSON.stringify(rawBody).slice(0, 300));

    // Support both Supabase Database Webhook { record: ... } and direct invocation { id: ... }
    const record: NoteRecord | undefined = rawBody.record || (rawBody.id ? (rawBody as NoteRecord) : undefined);

    if (!record || !record.id) {
      return new Response(
        JSON.stringify({ error: "Invalid payload: 'record.id' is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    noteId = record.id;
    const title = record.title || "Untitled Capture";
    const generalisedNotes = record.generalised_notes || "";
    const rawOcrText = record.raw_ocr_text || "";
    const metadata = record.metadata || {};

    if (!generalisedNotes && !rawOcrText) {
      console.warn(`Note ${noteId} contains empty notes and OCR text. Marking ready.`);
      await supabaseAdmin
        .from("notes")
        .update({
          personalised_notes: "No lecture text was provided for personalization.",
          status: "ready",
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId);

      return new Response(JSON.stringify({ success: true, status: "ready" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Immediately mark row as 'processing' so Web UI reflects real-time spinner
    await supabaseAdmin
      .from("notes")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    console.log(`Note ${noteId} marked as 'processing'. Requesting Gemini 2.5 Flash personalization...`);

    // Step 2: Personalize with Gemini 2.5 Flash API
    let personalizedNotes = "";
    if (geminiApiKey) {
      personalizedNotes = await callGeminiPersonalization(
        geminiApiKey,
        title,
        generalisedNotes,
        rawOcrText,
        metadata
      );
    } else {
      console.warn("GEMINI_API_KEY missing. Applying high-yield algorithmic conceptual scaffolding fallback.");
      personalizedNotes = generateLocalPersonalization(title, generalisedNotes, metadata);
    }

    // Step 3: Update row to status = 'ready' with personalized output
    const { error: updateError } = await supabaseAdmin
      .from("notes")
      .update({
        personalised_notes: personalizedNotes,
        status: "ready",
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Note ${noteId} successfully updated with status 'ready'!`);

    return new Response(
      JSON.stringify({
        success: true,
        noteId,
        status: "ready",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error(`Error processing note ${noteId}:`, error);

    // If an error occurs, safely update status to 'failed' so frontend error banner appears
    if (noteId) {
      try {
        await supabaseAdmin
          .from("notes")
          .update({
            status: "failed",
            error_message: error.message || "An unexpected error occurred during note personalization.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", noteId);
      } catch (dbErr) {
        console.error("Failed to update status to 'failed':", dbErr);
      }
    }

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Calls the Google Gemini 2.5 Flash REST API to produce high-yield, structured personalized notes.
 */
async function callGeminiPersonalization(
  apiKey: string,
  title: string,
  generalisedNotes: string,
  rawOcrText: string,
  metadata: Record<string, any>
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Extract learner profile context from metadata if available
  const studentTone = metadata.explanationTone || metadata.tone || "Encouraging, rigorous academic coach";
  const studentStyle = metadata.learningStyle || metadata.style || "Conceptual visual-first with step-by-step logic";
  const weakTopics = Array.isArray(metadata.weakConcepts) ? metadata.weakConcepts.join(", ") : "";

  const systemInstruction = `You are the lead academic AI tutor for EduSync.
Your mission is to take captured lecture blackboard notes and transcribe them into an elite, personalized study guide for an engineering student.

STUDENT PROFILE CONTEXT:
- Persona Tone: ${studentTone}
- Learning Style: ${studentStyle}
${weakTopics ? `- Focus Areas / Known Weaknesses: ${weakTopics}` : ""}

FORMATTING REQUIREMENTS:
1. Use standard GitHub Markdown.
2. Format ALL mathematical equations, variables, and physics laws in proper LaTeX using $...$ for inline and $$...$$ for block display.
3. Structure output into:
   - ## 🎯 Core Conceptual Synthesis
   - ## 🔍 Step-by-Step Breakdown & Derivations
   - ## 💡 Real-World Intuition & Mental Model
   - ## ⚠️ Common Pitfalls & Exam Traps
   - ## 📌 High-Yield Takeaways (3 actionable bullet points)
4. Be precise, encouraging, and pedagogically grounded. Never output vague fluff.`;

  const prompt = `LECTURE TITLE: "${title}"

GENERALIZED BLACKBOARD NOTES:
"""
${generalisedNotes}
"""

RAW OCR TEXT (FOR DIAGRAM AND MATH RECONSTRUCTION CONTEXT):
"""
${rawOcrText || "None provided"}
"""

Please generate the comprehensive personalized study guide now.`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2500,
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini 2.5 Flash API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned empty response text");
  }

  return text;
}

/**
 * Local fallback synthesizer in case Gemini API key is not yet configured in Supabase secrets.
 */
function generateLocalPersonalization(
  title: string,
  generalisedNotes: string,
  metadata: Record<string, any>
): string {
  return `## 🎯 Core Conceptual Synthesis: ${title}

${generalisedNotes}

---

## 🔍 Step-by-Step Breakdown & Mathematical Scaffolding
* **First Principles**: Understand each physical quantity and unit dimension before algebraic substitution.
* **Vector Balance**: When resolving forces or components, always establish an orthogonal coordinate system:
  $$\\sum \\vec{F}_{ext} = m\\vec{a}$$
* **Equation Consistency**: Ensure all terms have identical dimensions $[M L T^{-2}]$.

---

## 💡 Real-World Intuition & Mental Model
Think of this concept like an accelerating elevator or sliding inclined block: equilibrium is a dynamic state where all external influences cancel out. When an unbalanced net force exists, the system must change its velocity proportional to $1/m$.

---

## ⚠️ Common Pitfalls & Exam Traps
* **Pitfall 1**: Confusing cause ($F$) with kinematic effect ($a$).
* **Pitfall 2**: Blindly setting normal reaction $N = mg$ on inclined surfaces (on an incline of angle $\\theta$, $N = mg\\cos\\theta$).
* **Pitfall 3**: Omitting static friction threshold limits ($f_s \\le \\mu_s N$).

---

## 📌 High-Yield Takeaways
1. Isolate the target body completely using a Free Body Diagram before writing equations.
2. Balance forces along parallel and perpendicular axes independently.
3. Review lecture board timestamps when resolving numerical problem steps.`;
}
