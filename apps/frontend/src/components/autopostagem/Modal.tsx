'use client';

import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    withCloseButton?: boolean;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    size?: string;
    height?: string;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    withCloseButton = true,
    closeOnClickOutside = true,
    closeOnEscape = true,
    size,
    height,
    className,
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-popup/40 backdrop-blur-md transition-all animate-fadeIn text-textColor z-[9999] flex items-center justify-center p-4"
            onClick={closeOnClickOutside ? onClose : undefined}
            style={{ zIndex: 9999 }}
        >
            <div
                className={`gap-[40px] p-[32px] bg-newBgColorInner flex flex-col rounded-[24px] relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-auto ${className || ''}`}
                style={{
                    width: size || undefined,
                    height: height || undefined,
                    maxHeight: height || '90vh',
                    maxWidth: '100%'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center">
                        <div className="text-[24px] font-[600] flex-1 bg-gradient-to-r from-textColor to-textColor/70 bg-clip-text text-transparent">{title}</div>
                        {withCloseButton && (
                            <div className="absolute end-[24px] top-[24px]">
                                <button
                                    className="outline-none hover:bg-fifth/50 hover:scale-110 active:scale-95 transition-all cursor-pointer rounded-full p-2 group"
                                    type="button"
                                    onClick={onClose}
                                >
                                    <svg
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        className="text-textColor/50 group-hover:text-textColor transition-colors"
                                    >
                                        <path
                                            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                                            fill="currentColor"
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <div className="whitespace-pre-line">{children}</div>
            </div>
        </div>
    );
};
