'use client';
import { useState, useRef } from 'react';
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

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
              <button className="bg-gray-400 px-6 py-2 rounded-lg cursor-not-allowed font-bold" disabled>Stop Recording</button>
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-xl font-semibold mb-3">Transcript</h3>
            <textarea className="w-full h-32 p-2 rounded border border-gray-300" placeholder="Transcript will appear here..."></textarea>
            <div className="mt-4 flex justify-center">
              <button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-lg font-bold">Process</button>
            </div>
          </div>
          <div className="w-full mt-6">
            <h3 className="text-xl font-semibold mb-3">Extracted output</h3>
            <pre className="w-full h-32 p-2 rounded border border-gray-300 font-mono text-sm overflow-auto bg-white">
              <code>Extracted output will appear here...</code>
            </pre>
          </div>
        </div>
        {address ? (
          <TransactionWrapper address={address} />
        ) : (
          <WalletWrapper
            className="w-[600px] max-w-full"
            text="Sign in to transact"
          />
        )}
      </section>
      <Footer />
    </div>
  );
}
