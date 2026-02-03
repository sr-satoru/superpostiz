'use client';

import React, { FC, useState, useCallback, useRef, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Bold from '@tiptap/extension-bold';
import Text from '@tiptap/extension-text';
import Paragraph from '@tiptap/extension-paragraph';
import Underline from '@tiptap/extension-underline';
import { History } from '@tiptap/extension-history';
import { Placeholder } from '@tiptap/extensions';
import { BoldText } from '@gitroom/frontend/components/new-launch/bold.text';
import { UText } from '@gitroom/frontend/components/new-launch/u.text';
import { SignatureBox } from '@gitroom/frontend/components/signature';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';

const InterceptBoldShortcut = Extension.create({
    name: 'preventBoldWithUnderline',
    addKeyboardShortcuts() {
        return {
            'Mod-b': () => {
                this?.editor?.commands?.unsetUnderline();
                return this?.editor?.commands?.toggleBold();
            },
        };
    },
});

const InterceptUnderlineShortcut = Extension.create({
    name: 'preventUnderlineWithUnderline',
    addKeyboardShortcuts() {
        return {
            'Mod-u': () => {
                this?.editor?.commands?.unsetBold();
                return this?.editor?.commands?.toggleUnderline();
            },
        };
    },
});

interface EditorTextoModalProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const EditorTextoModal: FC<EditorTextoModalProps> = ({
    value,
    onChange,
    placeholder = "Digite sua legenda aqui...",
}) => {
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const editorRef = useRef<any>();

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            Document,
            Paragraph,
            Text,
            Bold,
            Underline,
            History,
            InterceptBoldShortcut,
            InterceptUnderlineShortcut,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'outline-none min-h-[150px] p-4 text-textColor',
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    useEffect(() => {
        if (editor) {
            editorRef.current = { editor };
        }
    }, [editor]);

    const addText = useCallback(
        (emoji: string) => {
            editor?.commands?.insertContent(emoji);
            editor?.commands?.focus();
        },
        [editor]
    );

    const valueWithoutHtml = useMemo(() => {
        return stripHtmlValidation('normal', value || '', true);
    }, [value]);

    return (
        <div className="flex flex-col gap-0 bg-newSettings border border-newTextColor/10 rounded-xl hover:border-newTextColor/20 transition-all duration-200">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-newTextColor/10 bg-newBgColorInner/50 rounded-t-xl">
                {/* Signature */}
                <SignatureBox editor={editor} />

                {/* Underline */}
                <UText
                    editor={editor}
                    currentValue={value}
                />

                {/* Bold */}
                <BoldText
                    editor={editor}
                    currentValue={value}
                />

                {/* Emoji Picker */}
                <div className="relative">
                    <div
                        className="select-none cursor-pointer rounded-lg w-[30px] h-[30px] bg-newColColor hover:bg-forth/10 flex justify-center items-center transition-all duration-200 hover:scale-110"
                        onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                        title="Inserir Emoji"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-textColor/70">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                    </div>
                    {emojiPickerOpen && (
                        <div className="absolute z-[100] top-[35px] -left-[50px]">
                            <EmojiPicker
                                height={400}
                                theme={(localStorage.getItem('mode') as Theme) || Theme.DARK}
                                onEmojiClick={(e) => {
                                    addText(e.emoji);
                                    setEmojiPickerOpen(false);
                                }}
                                open={emojiPickerOpen}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1" />

                {/* Character count */}
                <div className="text-xs text-textColor/40 font-medium">
                    {valueWithoutHtml.length} caracteres
                </div>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
};
