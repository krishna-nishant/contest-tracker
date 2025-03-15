import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: {
      // Map our toast API to sonner's API
      error: (options) => toast.error(options.title, { description: options.description }),
      success: (options) => toast.success(options.title, { description: options.description }),

      // Default toast function
      default: (options) => {
        if (options?.variant === "destructive") {
          return toast.error(options.title, { description: options.description });
        }
        return toast(options.title, { description: options.description });
      },
    },
  };
};
