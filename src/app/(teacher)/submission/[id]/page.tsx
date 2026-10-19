export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h2>Detail odevzdané konverzace ID: {params.id}</h2>
      {/* V budoucnu: <AdminChatInterface /> */}
    </div>
  );
}