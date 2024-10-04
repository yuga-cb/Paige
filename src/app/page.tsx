'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Footer from 'src/components/Footer';
import TransactionWrapper from 'src/components/TransactionWrapper';
import WalletWrapper from 'src/components/WalletWrapper';
import { ONCHAINKIT_LINK } from 'src/links';
import { useAccount } from 'wagmi';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';

export default function Page() {
  const { address } = useAccount();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [extractedTransaction, setExtractedTransaction] = useState('');
  const [receiverAddress, setReceiverAddress] = useState<`0x${string}` | undefined>();
  const [amountValue, setAmountValue] = useState(BigInt(0));
  const [isExtracting, setIsExtracting] = useState(false);

  const startRecording = async () => {
    console.log('Starting recording...');
    try {
      console.log('Requesting microphone access');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available event triggered');
        if (event.data.size > 0) {
          console.log(`Pushing chunk of size ${event.data.size}`);
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped');
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        console.log(`Created audio blob of size ${blob.size}`);
        setAudioBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorder.start();
      console.log('MediaRecorder started');
      setIsRecording(true);
      console.log('Recording state set to true');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      console.log('MediaRecorder exists and is recording');
      mediaRecorderRef.current.stop();
      console.log('MediaRecorder stopped');
      setIsRecording(false);
      console.log('Set is recording to false');
    } else {
      console.log('MediaRecorder not available or not recording');
    }
  };

  useEffect(() => {
    const transcribe = async () => {
      if (audioBlob) {
        setIsTranscribing(true);
        console.log('Set isRecording to false and isTranscribing to true');
        console.log('Audio blob created, size:', audioBlob.size);
        try {
          console.log('Starting audio transcription');
          const result = await transcribeAudio(audioBlob);
          console.log('Transcription result:', result);
          setTranscription(result);
        } catch (error) {
          console.error('Transcription error:', error);
          // Handle error (e.g., show error message to user)
        } finally {
          console.log('Transcription process completed');
          setIsTranscribing(false);
        }
      } else {
        console.log('No audio blob created');
      }
    };

    transcribe();
  }, [audioBlob]);

  async function transcribeAudio(audioBlob: Blob) {
    console.log('Transcribing audio, blob size:', audioBlob.size);
    // Convert Blob to File
    const audioFile = new File([audioBlob], "audio.wav", { type: audioBlob.type });
    console.log('Created audio file:', audioFile.name, 'size:', audioFile.size);

    const formData = new FormData();
    formData.append('audio', audioFile);
    console.log('FormData created with audio file');

    try {
      console.log('Sending POST request to /api/transcribe');
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      console.log('Received response, status:', response.status);
      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      console.log('Transcription data received:', data);
      return data.transcription;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  };

  const extractTransaction = useCallback(async () => {
    if (transcription) {
      setIsExtracting(true);
      try {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcription }),
        });

        if (!response.ok) {
          throw new Error('Failed to extract transaction');
        }

        const data = await response.json();
        setExtractedTransaction(data.transaction);
      } catch (error) {
        console.error('Error extracting transaction:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsExtracting(false);
      }
    }
  }, [transcription]);

  useEffect(() => {
    if (extractedTransaction) {
      try {
        const parsedTransaction = JSON.parse(extractedTransaction);
        if (parsedTransaction.receiver_address && parsedTransaction.amount_usdc) {
          setReceiverAddress(parsedTransaction.receiver_address);
          setAmountValue(BigInt(Math.round(parseFloat(parsedTransaction.amount_usdc) * 1e6)));
          console.log('Receiver address:', receiverAddress);
          console.log('Amount value:', amountValue);
        }
      } catch (error) {
        console.error('Error parsing extracted transaction:', error);
      }
    }
  }, [extractedTransaction]); // Added extractedTransaction as a dependency

  return (
    <div className="flex h-full w-96 max-w-full flex-col px-1 md:w-[1008px]">
      <section className="mt-6 mb-6 flex w-full flex-col md:flex-row">
        <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-0">
          <a
            href={ONCHAINKIT_LINK}
            title="paige"
            target="_blank"
            rel="noreferrer"
          >
            <h1 className="text-3xl font-bold text-blue-600">PaigeAI</h1>
          </a>
          <div className="flex items-center gap-3">
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>
      </section>
      <section className="templateSection flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-gray-100 px-2 py-4 md:grow">
        <div className="flex flex-col w-[600px] max-w-full items-center justify-center rounded-xl p-6">
          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold mb-3">Record with Microphone</h3>
            <div className="flex gap-4">
              <button 
                className={`${isRecording ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4f46e5] hover:bg-[#4338ca]'} text-white px-6 py-2 rounded-lg font-bold`}
                onClick={startRecording}
                disabled={isRecording}
              >
                Start Recording
              </button>
              <button 
                className={`${!isRecording ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4f46e5] hover:bg-[#4338ca]'} text-white px-6 py-2 rounded-lg font-bold`}
                onClick={stopRecording}
                disabled={!isRecording}
              >
                Stop Recording
              </button>
            </div>
          </div>

          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold mb-3">Record System Audio (e.g. Zoom Call)</h3>
            <div className="flex gap-4">
              <button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-lg font-bold">Start Recording</button>
              <button className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed font-bold" disabled>Stop Recording</button>
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-xl font-semibold mb-3">Transcript</h3>
            <textarea 
              className="w-full h-32 p-2 rounded border border-gray-300" 
              placeholder="Transcript will appear here..."
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-center">
              {isExtracting ? (
                <div className="text-blue-600">Extracting transaction...</div>
              ) : (
                <button 
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-lg font-bold"
                  onClick={extractTransaction}
                  disabled={!transcription}
                >
                  Extract Transaction
                </button>
              )}
            </div>
          </div>
          <div className="w-full mt-6">
            <h3 className="text-xl font-semibold mb-3">Extracted Transaction</h3>
            <pre className="w-full h-32 p-2 rounded border border-gray-300 font-mono text-sm overflow-auto bg-white">
              <code>{extractedTransaction || 'Extracted transaction will appear here...'}</code>
            </pre>
          </div>
        </div>
        {address && receiverAddress && amountValue ? (
          <TransactionWrapper 
            address={receiverAddress} 
            value={amountValue || BigInt(1)} 
          />
        ) : ''
        }
      </section>
      <Footer />
    </div>
  );
}
