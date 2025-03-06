import React from 'react';
import { X, Code2, Save, Plus, Volume2, Send } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-500" />
            Como funciona o Dev Assistant
          </h2>

          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Chat Inteligente</h3>
              <p className="text-gray-600">
                Converse com o Julio, um assistente virtual especializado em programação que entende e responde suas dúvidas de forma natural e técnica.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Recursos Principais</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Send className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Envio de Mensagens</p>
                    <p className="text-gray-600">Digite sua pergunta e pressione Enter ou clique no botão de enviar</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Code2 className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Editor de Código</p>
                    <p className="text-gray-600">Visualize e edite código com syntax highlighting em várias linguagens</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Save className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Salvar Código</p>
                    <p className="text-gray-600">Transfira o código do chat para o editor com um clique</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Plus className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Adicionar ao Projeto</p>
                    <p className="text-gray-600">Salve o código como um novo arquivo no seu projeto</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Leitura de Voz</p>
                    <p className="text-gray-600">Ouça as respostas em português com a tecnologia de text-to-speech</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Console Interativo</h3>
              <p className="text-gray-600">
                Visualize logs e resultados de execução no console integrado abaixo do editor.
              </p>
            </section>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Entendi!
          </button>
        </div>
      </div>
    </div>
  );
}