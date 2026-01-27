import React from 'react';
import styles from './TurnIndicator.module.css';
import { Member } from '@/lib/types';
import clsx from 'clsx'; // Assuming clsx is installed or will be

interface TurnIndicatorProps {
    member: Member;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({ member }) => {
    return (
        <div className={clsx(styles.container, 'glass')}>
            <span className={styles.label}>Current Turn</span>
            <div className={styles.memberInfo}>
                {member.avatar && member.avatar.startsWith('http') ? (
                    <img
                        src={member.avatar}
                        alt={member.name}
                        className={styles.avatar}
                        style={{ width: '1em', height: '1em', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                    />
                ) : (
                    <span className={styles.avatar} role="img" aria-label="avatar">
                        {member.avatar || '👤'}
                    </span>
                )}
                <span className={clsx(styles.name, 'text-gradient')}>
                    {member.name}
                </span>
            </div>
        </div>
    );
};
