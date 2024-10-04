import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant designed to analyze conversations and identify when participants have expressed intent related to a transaction. Your task is to extract the relevant details of the transaction, whether or not it has been fully agreed upon, and format them according to a specific JSON schema.

Instructions:

1. Carefully read through the entire conversation provided to you.
2. Identify any indication of a transaction, even if there is no explicit agreement or confirmation. The intent to perform a transaction should be extracted unless it is explicitly denied or rejected.
3. If you detect intent from one party to perform a transaction (whether agreed upon or not), extract the following information:

- Sender's crypto address (if mentioned)
- Receiver's crypto address (if mentioned)
- Amount of USDC to be sent (if an amount is discussed, even if not confirmed)
- Timestamp of the discussion (use "Null" if not available)
- Transaction ID (if mentioned)
- **Comment**: Describe the action or proposal, including what the transaction is for, the amount, and any context regarding the intent, pending confirmation, or absence of rejection.

Special Handling:

- **If the sender's or receivers's address or ID is not clear in the conversation, set the respective field to "[NeedAddress]".**
- If the amount is unclear or not finalized, mention the discussed amount or write "[AmountNeeded]".
- Always extract and return partial information if it appears relevant to the transaction, even if it's tentative or requires clarification.

Format the extracted information into the following JSON schema:

{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "receiver_address": {
            "type": "string",
            "description": "Crypto address of the receiver. Use \"[NeedAddress]\" if not clear."
        },
        "amount_usdc": {
            "type": "string",
            "description": "Exact or discussed amount of USDC. Use \"[AmountNeeded]\" if not provided."
        },
        "timestamp": {
            "type": "string",
            "format": "date-time",
            "description": "The time when the transaction was discussed or proposed."
        },
        "comment": {
            "type": "string",
            "description": "Description of the transaction intent, action, or proposal, including context on any amounts and pending confirmations."
        }
    },
    "required": ["receiver_address", "amount_usdc"],
    "additionalProperties": false
}

Do NOT EVER respond with the Schema itself.

Now, analyze the following conversation and provide the JSON output, and ONLY the JSON output, as per the instructions:`;

export async function POST(request: Request) {
  console.log('POST request received in extract route');
  try {
    const { transcription } = await request.json();
    console.log('Received transcription:', transcription);

    if (!transcription) {
      console.log('Transcription is missing');
      return NextResponse.json({ error: 'Transcription is required' }, { status: 400 });
    }

    console.log('Sending request to OpenAI');
    const userPrompt = SYSTEM_PROMPT + "\n\n" + transcription + "\n\nExpected Output JSON:";
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are ChatGPT, a large language model trained by OpenAI." },
        { role: "user", content: userPrompt }
      ],
      temperature: 0,
      max_tokens: 500,
    });

    const extractedTransaction = completion.choices[0].message.content?.replace(/^```json\n?|\n?```$/g, '').trim();
    
    console.log('Extracted transaction:', extractedTransaction);

    return NextResponse.json({ transaction: extractedTransaction });
  } catch (error) {
    console.error('Error in extract-transaction route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
