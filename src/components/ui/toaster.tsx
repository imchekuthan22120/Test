import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import notificationAvatar from "@/assets/notification-avatar.gif";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-center gap-2">
              <img 
                src={notificationAvatar} 
                alt="" 
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="grid gap-0.5">
                {title && <ToastTitle className="text-xs">{title}</ToastTitle>}
                {description && <ToastDescription className="text-xs">{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
