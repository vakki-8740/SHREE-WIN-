import ComplaintForm from '../components/ComplaintForm.jsx';

export default function Deposite() {
  return (
    <ComplaintForm
      type="DEPOSITE"
      title="DEPOSITE ISSUE COMPLAIN PAGE"
      amountLabel="Enter Deposit Amount"
      amountName="deposit-amount"
      imageLabel="Upload Payment Image"
      problemNotReceived="NOT RECEIVED GAME ACCOUNT"
    />
  );
}
