import { X } from "lucide-react";
import { createPortal } from "react-dom";

export default function ImageModal({ src, onClose }) {
  if (!src) return null;

  return createPortal(
    <div 
      className="modal-backdrop"
      style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(6px)"
      }}
      onClick={onClose}
    >
      <div 
        style={{ position: "relative", maxWidth: "95vw", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: -40,
            right: 0,
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: 8
          }}
        >
          <X size={32} />
        </button>
        <img 
          src={src} 
          alt="Zoomed view" 
          style={{ 
            maxWidth: "100%", 
            maxHeight: "85vh", 
            objectFit: "contain", 
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)"
          }} 
        />
      </div>
    </div>,
    document.body
  );
}
