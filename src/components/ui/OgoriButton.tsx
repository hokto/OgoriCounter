'use client';

import React from 'react';
import styles from './OgoriButton.module.css';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface OgoriButtonProps {
    isActive: boolean;
    onPay: () => void;
    currentPayerName?: string;
    isCurrentPayer?: boolean;
    disabled?: boolean;
}

export const OgoriButton: React.FC<OgoriButtonProps> = ({ isActive, onPay, currentPayerName, isCurrentPayer = false, disabled = false }) => {
    const handleClick = () => {
        if (isActive && !disabled) {
            onPay();
        }
    };

    // 3 states: active (confirmer), payer (waiting), bystander (waiting)
    const getLabel = () => {
        if (isActive) return "ありがとう！";
        if (isCurrentPayer) return "おまかせ中♪";
        return "待ってるよ〜";
    };

    const getSubLabel = () => {
        if (isActive) return "タップして確認 ✓";
        if (isCurrentPayer) return "あなたの番です";
        return "Waiting...";
    };

    return (
        <div className={clsx(styles.container, isActive && styles.active)}>
            <motion.div
                className={styles.glow}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.button
                className={styles.button}
                onClick={handleClick}
                disabled={disabled || !isActive}
                whileTap={{ scale: 0.95 }}
                aria-label={isActive ? "Confirm payment" : "Wait for turn"}
            >
                <div className={styles.glassContent}>
                    <span className={styles.label} style={{ fontSize: isActive ? '1.2rem' : '1.1rem' }}>
                        {getLabel()}
                    </span>
                    <span className={styles.subLabel}>
                        {getSubLabel()}
                    </span>
                </div>
            </motion.button>
        </div>
    );
};
