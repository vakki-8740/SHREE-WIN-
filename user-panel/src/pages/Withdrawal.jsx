import ComplaintForm from '../components/ComplaintForm.jsx';

export default function Withdrawal() {
  return (
    <ComplaintForm
      type="WITHDRAWAL"
      title="WITHDRAWAL ISSUE COMPLAIN PAGE"
      amountLabel="Enter Withdrawal Amount"
      amountName="withdrawal-amount"
      imageLabel="Upload Withdrawal Issue Image"
      problemNotReceived="NOT RECEIVED BANK ACCOUNT"
    />
  );
}
