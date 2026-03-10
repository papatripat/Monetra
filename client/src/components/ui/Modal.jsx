import { HiOutlineX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content */}
            <div className={`relative w-full ${sizes[size]} glass-card animate-scale-in`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/50">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700/50 transition-colors"
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
