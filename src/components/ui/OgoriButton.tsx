'use client';

import React from 'react';
import styles from './OgoriButton.module.css';
import { motion } from 'framer-motion';
import clsx from 'clsx'; // Assuming clsx is installed or will be

interface OgoriButtonProps {
    isActive: boolean;
    onPay: () => void;
    nextName?: string;
    disabled?: boolean;
}

export const OgoriButton: React.FC<OgoriButtonProps> = ({ isActive, onPay, nextName, disabled = false }) => {
    const handleClick = () => {
        if (isActive && !disabled) {
            onPay();
        }
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
                aria-label={isActive ? "Pay now" : "Wait for turn"}
            >
                <div className={styles.glassContent}>
                    <span className={styles.label} style={{ fontSize: isActive ? '1.4rem' : '1.2rem' }}>
                        {isActive ? "払うよ〜" : "見守り中"}
                    </span>
                    <span className={styles.subLabel}>
                        {isActive ? "It's my turn!" : "Waiting..."}
                    </span>
                </div>
            </motion.button>
        </div>
    );
};
