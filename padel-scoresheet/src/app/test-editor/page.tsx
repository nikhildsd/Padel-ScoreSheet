'use client';

import SimpleTeamEditor from '@/components/SimpleTeamEditor';

export default function TestEditorPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <SimpleTeamEditor
        courtNumber={1}
        leftTeamName="Nikhil"
        rightTeamName="mASTER"
      />
    </div>
  );
}