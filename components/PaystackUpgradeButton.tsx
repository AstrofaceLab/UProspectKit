"use client";

import React from "react";
import { usePaystackPayment } from "react-paystack";
import toast from "react-hot-toast";

interface PaystackUpgradeButtonProps {
  email: string;
  amount: number;
  publicKey: string;
  plan?: string;
  upgrading: boolean;
  setUpgrading: (val: boolean) => void;
  onSuccess: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

const PaystackUpgradeButton: React.FC<PaystackUpgradeButtonProps> = ({
  email,
  amount,
  publicKey,
  plan,
  upgrading,
  setUpgrading,
  onSuccess,
  children,
  ...props
}) => {
  const config = {
    reference: new Date().getTime().toString(),
    email,
    amount,
    publicKey,
    plan,
  };

  const initializePayment = usePaystackPayment(config);

  const handlePaymentOnSuccess = (reference: any) => {
    onSuccess();
  };

  const handlePaymentOnClose = () => {
    setUpgrading(false);
  };

  const handleUpgrade = () => {
    if (upgrading) return;
    setUpgrading(true);
    try {
      initializePayment({
        onSuccess: handlePaymentOnSuccess,
        onClose: handlePaymentOnClose,
      });
    } catch (err) {
      console.error("Paystack initialization error:", err);
      toast.error("Failed to initialize payment");
      setUpgrading(false);
    }
  };

  return (
    <button onClick={handleUpgrade} disabled={upgrading} {...props}>
      {children}
    </button>
  );
};

export default PaystackUpgradeButton;
