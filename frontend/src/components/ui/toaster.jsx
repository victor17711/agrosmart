import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={2500}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="bg-teal-600 text-white border border-teal-500 shadow-2xl rounded-2xl px-5 py-4 flex items-start gap-3 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-4 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-4"
          >
            <div className="flex-1">
              {title && (
                <ToastTitle className="text-white font-bold text-base">
                  {title}
                </ToastTitle>
              )}

              {description && (
                <ToastDescription className="text-white/90 text-sm font-medium">
                  {description}
                </ToastDescription>
              )}
            </div>

            {action}

            <ToastClose className="text-white/80 hover:text-white" />
          </Toast>
        )
      })}

      <ToastViewport className="!fixed !top-6 !left-1/2 !-translate-x-1/2 !bottom-auto !right-auto z-[9999] flex flex-col gap-3 w-[90%] max-w-md" />
    </ToastProvider>
  )
}