import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

interface InfoPopupProps {
    title: string,
    description: string
}

const InfoPopup = ({ title, description }: InfoPopupProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Info className="h-5" />
                </TooltipTrigger>
                <TooltipContent>
                    <strong>{title}</strong>
                    <p>{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default InfoPopup;