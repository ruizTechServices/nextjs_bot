// app/api/chat/route.ts
import { NextResponse } from "next/server";
import openai from "../../../utils/openai/client";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { prompt, conversation_id } = await request.json();
    if (!prompt || !conversation_id) {
      return NextResponse.json(
        { message: "Prompt and conversation_id are required" },
        { status: 400 }
      );
    }

    // Determine the next position_id for this conversation
    const { data: lastMessage } = await supabase
      .from("conversations")
      .select("position_id")
      .eq("conversation_id", conversation_id)
      .order("position_id", { ascending: false })
      .limit(1)
      .single();

    // If there is no last message, start with position 1
    let userPositionId = lastMessage ? lastMessage.position_id + 1 : 1;

    // Insert the user's message into Supabase
    const { error: insertUserError } = await supabase.from("conversations").insert([
      {
        conversation_id,
        position_id: userPositionId,
        timestamp: new Date().toISOString(),
        role: "user",
        message: prompt,
      },
    ]);
    if (insertUserError) {
      console.error("Error inserting user message:", insertUserError);
      // Optionally, handle the error appropriately
    }

    // Call OpenAI API for the assistant's response
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    // Validate the response from OpenAI
    if (!response.choices || !response.choices[0]?.message?.content) {
      return NextResponse.json(
        { message: "Invalid response from OpenAI" },
        { status: 500 }
      );
    }
    const assistantMessage = response.choices[0].message.content;

    // Insert the assistant's response into Supabase with the next position id
    const assistantPositionId = userPositionId + 1;
    const { error: insertAssistantError } = await supabase.from("conversations").insert([
      {
        conversation_id,
        position_id: assistantPositionId,
        timestamp: new Date().toISOString(),
        role: "assistant",
        message: assistantMessage,
      },
    ]);
    if (insertAssistantError) {
      console.error("Error inserting assistant message:", insertAssistantError);
      // Optionally, handle this error as needed
    }

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { message: "Error generating completion", error: error.message },
      { status: 500 }
    );
  }
}