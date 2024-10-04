'use client';
import Footer from 'src/components/Footer';
import TransactionWrapper from 'src/components/TransactionWrapper';
import WalletWrapper from 'src/components/WalletWrapper';
import { ONCHAINKIT_LINK } from 'src/links';
import OnchainkitSvg from 'src/svg/OnchainkitSvg';
import { useAccount } from 'wagmi';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';

export default function Page() {
  const { address } = useAccount();

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
            <OnchainkitSvg />
          </a>
          <div className="flex items-center gap-3">
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>
      </section>
      <section className="templateSection flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-gray-100 px-2 py-4 md:grow">
        <div className="flex flex-col w-[600px] max-w-full items-center justify-center rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Record and Transcribe Audio</h2>
          
          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold mb-3">Record with Microphone</h3>
            <div className="flex gap-4">
              <button className="bg-blue-300 hover:bg-blue-400 text-black px-4 py-2 rounded">Start Recording</button>
              <button className="bg-gray-400 px-4 py-2 rounded cursor-not-allowed" disabled>Stop Recording</button>
            </div>
          </div>

          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold mb-3">Record System Audio (e.g. Zoom Call)</h3>
            <div className="flex gap-4">
              <button className="bg-blue-300 hover:bg-blue-400 text-black px-4 py-2 rounded">Start Recording</button>
              <button className="bg-gray-400 px-4 py-2 rounded cursor-not-allowed" disabled>Stop Recording</button>
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-xl font-semibold mb-3">Transcript</h3>
            <textarea className="w-full h-32 p-2 rounded border border-gray-300" placeholder="Transcript will appear here..."></textarea>
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
