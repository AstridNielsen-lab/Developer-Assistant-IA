import React, { useState } from 'react';
import { Loader2, Rocket } from 'lucide-react';
import { boltFunctions } from '../config';
import toast from 'react-hot-toast';

interface DeployButtonProps {
  provider?: string;
  buildCommand?: string;
  outputDir?: string;
}

export default function DeployButton({ 
  provider = 'netlify',
  buildCommand = 'npm run build',
  outputDir = 'dist'
}: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    const loadingToast = toast.loading('Iniciando deploy...');

    try {
      const result = await boltFunctions.deploy(provider, buildCommand, outputDir);
      
      if (result?.deployId) {
        // Poll for deployment status
        const interval = setInterval(async () => {
          const status = await boltFunctions.getDeploymentStatus(result.deployId);
          
          if (status?.ready) {
            clearInterval(interval);
            setIsDeploying(false);
            toast.success('Deploy concluído com sucesso!', { id: loadingToast });
            
            if (status.url) {
              window.open(status.url, '_blank');
            }
          } else if (status?.error) {
            clearInterval(interval);
            setIsDeploying(false);
            toast.error(`Erro no deploy: ${status.error}`, { id: loadingToast });
          }
        }, 2000);
      } else {
        throw new Error('Failed to start deployment');
      }
    } catch (error) {
      console.error('Deploy error:', error);
      setIsDeploying(false);
      toast.error('Erro ao fazer deploy', { id: loadingToast });
    }
  };

  return (
    <button
      onClick={handleDeploy}
      disabled={isDeploying}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isDeploying
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600'
      } text-white`}
    >
      {isDeploying ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Deploying...</span>
        </>
      ) : (
        <>
          <Rocket className="w-5 h-5" />
          <span>Deploy</span>
        </>
      )}
    </button>
  );
}