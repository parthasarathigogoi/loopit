export {};

declare global {
  interface Window {
    Paytm?: {
      CheckoutJS?: {
        onLoad: (callback: () => void) => void;
        init: (config: Record<string, unknown>) => Promise<unknown>;
        invoke: () => void;
        close: () => void;
      };
    };
  }
}
