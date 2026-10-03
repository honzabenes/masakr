"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Bot, GraduationCap, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { Message, ConversationStatus } from "@/types";

interface ChildChatInterfaceProps {
    taskTitle: string;
    initialStatus: ConversationStatus;
    initialMessages: Message[];
}

export default function ChildChatInterface({
    taskTitle,
    initialStatus,
    initialMessages,
}: ChildChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [status, setStatus] = useState<ConversationStatus>(initialStatus);
    const [inputValue, setInputValue] = useState("");
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
        id: crypto.randomUUID(),
        sender_type: "kid",
        content: inputValue.trim(),
        created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fakeImageUrl = URL.createObjectURL(file);
        const newMessage: Message = {
        id: crypto.randomUUID(),
        sender_type: "kid",
        content: "Posílám fotku řešení:",
        image_url: fakeImageUrl,
        created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
        if (fileInputRef.current) {
        fileInputRef.current.value = "";
        }
    };

    const statusConfig = {
        in_progress: { label: "Nedokončeno", variant: "secondary" as const },
        submitted: { label: "Odevzdáno", variant: "default" as const },
        graded: { label: "Ohodnoceno", variant: "outline" as const },
    };

    return (
        <Card className="flex flex-col h-[85vh] max-w-4xl mx-auto shadow-lg border-border rounded-2xl overflow-hidden bg-card text-card-foreground">
        
        {/* HEADER */}
        <header className="flex items-center justify-between p-6 bg-muted/30 border-b border-border">
            <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {taskTitle}
            </h1>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">Stav úkolu:</span>
                <Badge variant={statusConfig[status].variant} className="text-sm px-3 py-0.5 rounded-full">
                {statusConfig[status].label}
                </Badge>
            </div>
            </div>

            {status === "in_progress" && (
            <Button 
                onClick={() => setStatus("submitted")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm text-base py-6 px-6 font-semibold"
            >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Odevzdat k hodnocení
            </Button>
            )}
        </header>

        {/* MESSAGES AREA */}
        <ScrollArea className="flex-1 p-6 bg-background">
            <div className="flex flex-col space-y-6">
            {messages.map((msg) => {
                const isKid = msg.sender_type === "kid";
                const isAi = msg.sender_type === "ai";
                const isAdmin = msg.sender_type === "admin";

                return (
                <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${
                    isKid ? "self-end flex-row-reverse" : "self-start"
                    }`}
                >
                    {/* Avatary */}
                    {!isKid && (
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isAi 
                        ? "bg-secondary text-secondary-foreground" 
                        : "bg-accent text-accent-foreground border border-border"
                    }`}>
                        {isAi ? <Bot className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                    </div>
                    )}

                    {/* Bublina zprávy */}
                    <div
                    className={`flex flex-col space-y-2 p-4 rounded-2xl text-lg ${
                        isKid
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : isAi
                        ? "bg-card border border-border text-card-foreground shadow-sm rounded-tl-sm"
                        : "bg-accent border-2 border-border text-accent-foreground rounded-tl-sm"
                    }`}
                    >
                    {isAdmin && (
                        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Zpráva od učitele
                        </span>
                    )}
                    
                    <span>{msg.content}</span>
                    
                    {msg.image_url && (
                        <img
                        src={msg.image_url}
                        alt="Obrázek úkolu"
                        className="mt-2 rounded-xl border border-border/50 max-h-64 object-cover"
                        />
                    )}
                    </div>
                </div>
                );
            })}
            <div ref={messagesEndRef} />
            </div>
        </ScrollArea>

        {/* INPUT AREA */}
        <div className="p-4 bg-card border-t border-border">
            {status !== "in_progress" ? (
            <div className="p-6 text-center text-muted-foreground bg-muted rounded-xl border border-dashed border-border">
                {status === "submitted" 
                ? "Tento úkol jsi již odevzdal/a. Nyní čekáme na kontrolu od pana učitele."
                : "Tento úkol je již ohodnocen. Skvělá práce!"}
            </div>
            ) : (
            <div className="flex items-center gap-3">
                <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                />
                
                <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-accent border-border"
                onClick={() => fileInputRef.current?.click()}
                >
                <ImageIcon className="w-6 h-6" />
                </Button>

                <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Napiš odpověď..."
                className="flex-1 h-14 text-lg rounded-full px-6 bg-muted border-transparent focus-visible:ring-ring focus-visible:bg-background transition-all shadow-none text-foreground"
                />

                <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-14 w-14 rounded-full flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                <Send className="w-6 h-6 ml-1" />
                </Button>
            </div>
            )}
        </div>
        </Card>
    );
}