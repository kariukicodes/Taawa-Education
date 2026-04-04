import { createContext, useContext, useMemo, useState } from "react";

import { ContactModal } from "./ContactModal";

type ContactModalContextValue = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  setOpen: (open: boolean) => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const value = useMemo<ContactModalContextValue>(
    () => ({
      open,
      setOpen,
      openModal: () => setOpen(true),
      closeModal: () => setOpen(false),
    }),
    [open]
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <ContactModal open={open} onOpenChange={setOpen} />
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal must be used within ContactModalProvider");
  }
  return ctx;
}
