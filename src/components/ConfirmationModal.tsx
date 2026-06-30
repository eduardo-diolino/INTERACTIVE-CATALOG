import React from "react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({ open, onConfirm, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 max-w-sm w-full mx-4 rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-medium text-black mb-2">Obrigada pela sua escolha!</h2>
        <p className="text-sm text-black/70 mb-4">Mensagem de agradecimento da <span className="font-semibold">Agna Costa</span>. Sua seleção foi enviada.</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-black/20 text-black hover:bg-black/5"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
