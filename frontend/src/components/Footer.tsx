import { BookOpen } from "lucide-react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import logo from "../assets/logo-zktanit.png";

export function Footer() {
  return (
    <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative animate-pulse-slow">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-16 w-10 animate-pulse-slow transition-all duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">ZK-Tanit-ID</h3>
                <p className="text-sm text-purple-300">
                  Privacy-Preserving Identity
                </p>
              </div>
            </div>
            <p className="text-slate-400 max-w-md mb-4">
              Secure, private, and decentralized identity verification using
              zero-knowledge proofs and the Midnight blockchain network.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/carthagexlabs/zk-tanit-id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                <FaGithub className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/CarthageXLabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                <FaXTwitter className="h-5 w-5" />
              </a>
              <a
                href="https://carthagexlabs.medium.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                <BookOpen className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Technology</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Zero-Knowledge Proofs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Compact Smart Contracts
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Midnight Blockchain
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Architecture
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Security Audit
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 ZK-Tanit-ID. Built with privacy-first principles.
          </p>
        </div>
      </div>
    </footer>
  );
}
