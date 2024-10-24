// components/ErrorMessage.js
import styles from '../styles/ErrorMessage.module.css'; // CSS do componente

const ErrorMessage = ({ message }) => {
  return (
    <div className={styles.errorContainer}>
      <p className={styles.errorMessage}>{message}</p>
    </div>
  );
};

export default ErrorMessage;
