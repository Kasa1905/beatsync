"use client";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { SafeMotion } from "@components/SafeMotion";
import { Button } from "../ui/button";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  text, 
  className = "" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <SafeMotion.div 
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <SafeMotion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {text}
        </SafeMotion.p>
      )}
    </SafeMotion.div>
  );
};

interface LoadingStateProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const LoadingState = ({ 
  title = "Loading...", 
  description,
  children 
}: LoadingStateProps) => {
  return (
    <SafeMotion.div 
      className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner size="lg" />
      
      <SafeMotion.div 
        className="mt-6 space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        )}
      </SafeMotion.div>

      {children && (
        <SafeMotion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {children}
        </SafeMotion.div>
      )}
    </SafeMotion.div>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  children?: React.ReactNode;
}

export const ErrorState = ({ 
  title = "Something went wrong", 
  description = "We encountered an error while loading this content.",
  onRetry,
  retryText = "Try again",
  children 
}: ErrorStateProps) => {
  return (
    <SafeMotion.div 
      className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <SafeMotion.div 
        className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </SafeMotion.div>
      
      <SafeMotion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      </SafeMotion.div>

      {onRetry && (
        <SafeMotion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={onRetry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {retryText}
          </Button>
        </SafeMotion.div>
      )}

      {children && (
        <SafeMotion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {children}
        </SafeMotion.div>
      )}
    </SafeMotion.div>
  );
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const EmptyState = ({ 
  title = "Nothing here yet", 
  description = "Get started by adding some content.",
  action,
  icon,
  children 
}: EmptyStateProps) => {
  return (
    <SafeMotion.div 
      className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <SafeMotion.div 
          className="mb-4 text-muted-foreground"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {icon}
        </SafeMotion.div>
      )}
      
      <SafeMotion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      </SafeMotion.div>

      {action && (
        <SafeMotion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </SafeMotion.div>
      )}

      {children && (
        <SafeMotion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {children}
        </SafeMotion.div>
      )}
    </SafeMotion.div>
  );
};
