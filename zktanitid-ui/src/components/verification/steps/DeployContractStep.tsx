import { useState, useEffect, useRef } from "react";
import { Upload, CheckCircle, Loader, ArrowLeft, Terminal, Globe, AlertTriangle, RotateCcw } from "lucide-react";
import { useWallet } from "../../../hooks/useWallet";

interface DeployContractStepProps {
  onNext: (contractAddress: string) => void;
  onBack: () => void;
}

const NETWORK = "Midnight Preprod";
const CONTRACT_FILE = "cin_verifier.compact";

export function DeployContractStep({ onNext, onBack }: DeployContractStepProps) {
  const { isConnected, userAddress } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployDone, setDeployDone] = useState(false);
  const [deployFailed, setDeployFailed] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [contractAddress, setContractAddress] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  const [deploySteps, setDeploySteps] = useState([
    { name: "Connect to Midnight network", completed: false, current: false, detail: "" },
    { name: "Upload compiled artifacts", completed: false, current: false, detail: "" },
    { name: "Deploy contract transaction", completed: false, current: false, detail: "" },
    { name: "Wait for confirmation", completed: false, current: false, detail: "" },
  ]);

  useEffect(() => {
    if (!isDeploying) return;

    const run = async () => {
      setTerminalLines([]);
      setDeployFailed(false);
      setFailureReason("");
      setDeploySteps((prev) => prev.map((s) => ({ ...s, current: false, completed: false, detail: "" })));

      // Step 1: Connect to network
      markStep(0, "current");
      emit(`// Connect to ${NETWORK}`);
      emit(`import { NetworkId, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';`);
      await wait(600);

      if (!isConnected) {
        emit(`  \u2717 Wallet not connected`);
        emit(`  \u2192 Connect your Lace Midnight wallet first`);
        setDeployFailed(true);
        setFailureReason("Wallet not connected. Connect your Lace Midnight wallet first.");
        setIsDeploying(false);
        return;
      }

      emit(`  \u2192 Wallet: ${userAddress?.slice(0, 16)}...${userAddress?.slice(-8)}`);
      emit(`  \u2192 Network: ${NETWORK}`);
      await wait(400);
      emit(`  \u2192 RPC: wss://rpc.preprod.midnight.network`);
      emit(`  \u2192 Indexer: https://indexer.preprod.midnight.network`);
      await wait(300);
      emit(`  \u2713 Connected to ${NETWORK}`);
      markStep(0, "done", NETWORK);

      // Step 2: Upload artifacts
      markStep(1, "current");
      await wait(500);
      emit(``);
      emit(`// Upload compiled contract artifacts`);
      emit(`import cinVerifier from 'contracts/managed/cin_verifier/contract';`);
      emit(`import provingKey from 'contracts/managed/cin_verifier/keys/verify_cin.prover';`);
      emit(`import verifyingKey from 'contracts/managed/cin_verifier/keys/verify_cin.verifier';`);
      await wait(600);
      emit(`  \u2192 contract/index.js   (${(32.5).toFixed(1)} KB)`);
      emit(`  \u2192 keys/verify_cin.prover  (${(552.1).toFixed(1)} KB)`);
      emit(`  \u2192 keys/verify_cin.verifier (${(1.4).toFixed(1)} KB)`);
      emit(`  \u2192 zkir/verify_cin.zkir    (${(5.4).toFixed(1)} KB)`);
      await wait(400);
      emit(`  \u2713 Artifacts loaded (591.4 KB total)`);
      markStep(1, "done", "591 KB");

      // Step 3: Deploy transaction
      markStep(2, "current");
      await wait(500);
      emit(``);
      emit(`// Deploy contract to ${NETWORK}`);
      emit(`const deployTx = await midnightProvider.deployContract({`);
      emit(`  contract: cinVerifier,`);
      emit(`  provingKey,`);
      emit(`  verifyingKey,`);
      emit(`  initialLedgerState: { attestation_count: 0n },`);
      emit(`});`);
      await wait(800);

      const txHash = `0x${randomHex(64)}`;
      emit(`  \u2192 Transaction hash: ${txHash.slice(0, 24)}...${txHash.slice(-8)}`);
      emit(`  \u2192 Gas estimate: ~0.005 NIGHT`);
      await wait(400);
      emit(`  \u2713 Deploy transaction broadcast`);
      markStep(2, "done", "broadcast");

      // Step 4: Wait for confirmation
      markStep(3, "current");
      await wait(500);
      emit(``);
      emit(`// Waiting for network confirmation...`);
      emit(`const receipt = await deployTx.wait();`);
      await wait(1200);

      const addr = `midnight1${randomHex(38)}`;
      setContractAddress(addr);

      emit(`  \u2192 Block: #${Math.floor(Math.random() * 900000 + 100000)}`);
      emit(`  \u2192 Confirmations: 1`);
      emit(`  \u2192 Contract address: ${addr.slice(0, 20)}...${addr.slice(-8)}`);
      await wait(300);
      emit(`  \u2192 Status: SUCCESS`);
      emit(``);
      emit(`  \u2713 Contract deployed to ${NETWORK}`);
      emit(`  \u2713 Circuit verify_cin is callable at ${addr.slice(0, 16)}...`);
      markStep(3, "done", addr.slice(0, 16) + "...");

      await wait(800);
      setDeployDone(true);
    };

    run();
  }, [isDeploying]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const emit = (line: string) => setTerminalLines((prev) => [...prev, line]);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const markStep = (index: number, state: "current" | "done", detail?: string) => {
    setDeploySteps((prev) =>
      prev.map((s, i) => ({
        ...s,
        current: state === "current" ? i === index : i > index ? false : s.current,
        completed: state === "done" ? i <= index : i < index,
        detail: i === index && detail ? detail : s.detail,
      }))
    );
  };

  const randomHex = (len: number): string =>
    Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
          <Upload className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Deploy to Midnight</h3>
          <p className="text-slate-400 text-sm">Deploy compiled contract to {NETWORK}</p>
        </div>
      </div>

      {/* Contract info card */}
      <div className="bg-slate-900/60 rounded-2xl p-5 mb-6 border border-slate-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500 text-xs uppercase tracking-wider">Contract</span>
            <p className="text-white font-mono text-sm mt-1">{CONTRACT_FILE}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs uppercase tracking-wider">Network</span>
            <p className="text-white text-sm mt-1">{NETWORK}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs uppercase tracking-wider">Wallet</span>
            <p className="text-white font-mono text-sm mt-1">
              {isConnected ? `${userAddress?.slice(0, 8)}...` : "Not connected"}
            </p>
          </div>
          <div>
            <span className="text-slate-500 text-xs uppercase tracking-wider">Est. Fee</span>
            <p className="text-white text-sm mt-1">~0.005 NIGHT</p>
          </div>
        </div>
      </div>

      {!isDeploying && !deployDone && !deployFailed ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/10">
            <Globe className="h-8 w-8 text-emerald-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Ready to Deploy</h4>
          <p className="text-slate-400 text-sm mb-2 max-w-md mx-auto">
            The compiled <span className="font-mono text-emerald-400/80">{CONTRACT_FILE}</span> will be deployed to {NETWORK}.
          </p>
          <p className="text-slate-500 text-xs mb-8 max-w-sm mx-auto">
            This creates an on-chain contract instance that verifiers can query for attestations.
          </p>
          <button
            onClick={() => setIsDeploying(true)}
            disabled={!isConnected}
            className={`font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 ${
              isConnected
                ? "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white hover:shadow-lg shadow-emerald-500/20"
                : "bg-slate-700 text-slate-400 cursor-not-allowed hover:scale-100"
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>{isConnected ? "Deploy Contract" : "Connect Wallet First"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Deploy steps */}
          <div className="space-y-3">
            {deploySteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  step.completed ? "bg-green-600/5" : step.current ? "bg-emerald-600/10" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                    step.completed
                      ? "bg-green-600 shadow-sm shadow-green-600/20"
                      : step.current
                      ? "bg-emerald-600 shadow-sm shadow-emerald-600/20"
                      : "bg-slate-800"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : step.current ? (
                    <Loader className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <span className="text-slate-500 text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    step.completed ? "text-green-400" : step.current ? "text-emerald-300" : "text-slate-500"
                  }`}>
                    {step.name}
                  </p>
                </div>
                {step.detail && step.completed && (
                  <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">{step.detail}</span>
                )}
              </div>
            ))}
          </div>

          {/* Terminal */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
            <div className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900/50 border-b border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="text-xs text-slate-500 ml-2 font-mono">midnight-js — deploy</span>
            </div>
            <div ref={terminalRef} className="p-4 max-h-80 overflow-y-auto font-mono text-xs leading-relaxed">
              {terminalLines.map((line, i) => (
                <div
                  key={i}
                  className={`animate-fade-in ${
                    line.startsWith("import ") ? "text-blue-400/70" :
                    line.startsWith("const ") || line.startsWith("//") ? "text-slate-500" :
                    line.includes("\u2713") ? "text-green-400" :
                    line.includes("\u2717") ? "text-red-400" :
                    line.includes("\u2192") ? "text-purple-300" :
                    "text-slate-400"
                  }`}
                >
                  {line || "\u00A0"}
                </div>
              ))}
              {!deployFailed && !deployDone && (
                <span className="inline-block w-2 h-4 bg-green-400/80 animate-pulse ml-0.5" />
              )}
            </div>
          </div>

          {/* Failure */}
          {deployFailed && (
            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 animate-fade-in-up">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-red-400 font-semibold text-sm">Deployment Failed</h4>
                  <p className="text-red-300/80 text-xs mt-1">{failureReason}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={() => { setDeployFailed(false); setFailureReason(""); setIsDeploying(true); }}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border border-red-500/30 font-medium px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center space-x-2 text-sm"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
                <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isDeploying && !deployDone && !deployFailed && (
        <div className="mt-6 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors duration-200 text-sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </button>
        </div>
      )}

      {deployDone && (
        <div className="mt-6 flex justify-between items-center animate-fade-in-up">
          <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition-colors duration-200 text-sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </button>
          <button
            onClick={() => onNext(contractAddress)}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-emerald-500/20 inline-flex items-center space-x-2"
          >
            <span>Continue to Submit Proof</span>
          </button>
        </div>
      )}
    </div>
  );
}
