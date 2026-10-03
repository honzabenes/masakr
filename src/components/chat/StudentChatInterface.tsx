"use client";

import React, { useState, useRef } from "react";
import { Send, Paperclip, Bot, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Message, ConversationStatus } from "@/types";

export interface StudentChatInterfaceProps {
    taskTitle: string; 
    status: ConversationStatus;
    messages: Message[];
}

export default function StudentChatInterface({
    status,
    messages,
}: StudentChatInterfaceProps) {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Dynamické roztahování textarey podle obsahu
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        if (textareaRef.current) {
            // Reset výšky na auto, aby se mohl zmenšit při mazání textu
            textareaRef.current.style.height = "auto";
            // Nastavení výšky přesně podle scrollHeight
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    return (
        <main className="flex flex-col h-full w-full max-w-4xl rounded-md overflow-hidden bg-card text-card-foreground">
            
            {/* OBLAST ZPRÁV */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 bg-background">
                <div className="flex flex-col space-y-6">
                    {messages.map((msg) => {
                        const isStudent = msg.sender_type === "student";
                        const isAi = msg.sender_type === "ai";
                        const isAdmin = msg.sender_type === "admin";

                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-2 md:gap-3 max-w-[90%] md:max-w-[85%] ${
                                    isStudent 
                                        ? "self-end flex-col items-end md:flex-row-reverse md:items-start" 
                                        : "self-start flex-col items-start md:flex-row md:items-start"
                                }`}
                            >
                                {/* Avatary */}
                                {!isStudent && (
                                    <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center ${
                                        isAi 
                                            ? "bg-muted text-muted-foreground" 
                                            : "bg-orange-100 text-orange-700 border border-orange-200"
                                    }`}>
                                        {isAi ? <Bot className="w-5 h-5 md:w-6 md:h-6" /> : <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />}
                                    </div>
                                )}

                                {/* Bublina zprávy */}
                                <div
                                    className={`flex flex-col space-y-2 p-3 md:p-4 text-sm md:text-base leading-relaxed shadow-sm ${
                                        isStudent
                                            ? "bg-primary text-primary-foreground rounded-lg md:rounded-tr-sm"
                                            : isAi
                                            ? "bg-card border border-border text-card-foreground rounded-lg md:rounded-tl-sm"
                                            : "bg-orange-50 border-2 border-orange-400 text-orange-950 rounded-lg md:rounded-tl-sm"
                                    }`}
                                >
                                    {isAdmin && (
                                        <span className="text-[10px] md:text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">
                                            Zpráva od učitele
                                        </span>
                                    )}
                                    
                                    <span>{msg.content}</span>
                                    
                                    {msg.image_url && (
                                        <img
                                            src={msg.image_url}
                                            alt="Obrázek k řešení"
                                            className="mt-2 md:mt-3 rounded-md border border-border/50 max-h-48 md:max-h-64 object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* VSTUPNÍ OBLAST - Pokročilé UX ve stylu Gemini */}
            <div className="p-3 md:p-4 bg-card shrink-0">
                {status !== "in_progress" ? (
                    <div className="p-4 md:p-6 text-center text-sm md:text-base text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border/60">
                        Úkol byl odevzdán a {status === "submitted" ? "čeká na hodnocení." : "již byl ohodnocen."}
                    </div>
                ) : (
                    <div className="flex flex-col w-full bg-muted/40 border border-border rounded-2xl p-2 md:p-3 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
                        
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={handleInput}
                            rows={1}
                            placeholder="Napsat zprávu..."
                            className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-[16px] md:text-base px-2 py-1 max-h-32 md:max-h-48 overflow-y-auto"
                        />
                        
                        <div className="flex items-center justify-between mt-2">
                            {/* Obal pro ikonu nahrávání */}
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 text-muted-foreground hover:text-primary hover:bg-muted"
                                >
                                    <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
                                </Button>
                            </div>

                            {/* Odesílací tlačítko uvnitř input pole */}
                            <Button
                                disabled={!inputValue.trim()}
                                className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}