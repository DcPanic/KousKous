import { useState } from 'react';
import { Check, CircleDashed, X } from 'lucide-react';
import { hostApplications, type ApprovalStatus, type HostApplication } from '../data/mock';

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Εκκρεμεί',
  approved: 'Εγκρίθηκε',
  rejected: 'Απορρίφθηκε',
};

/**
 * Manual host approval queue (spec §2.3).
 *
 * Approval only sets `community_approved`. Charging for events additionally
 * requires `payment_verified`, which the payment provider sets via webhook —
 * the two gates are shown separately so they are never conflated.
 */
export function HostApprovalsPage() {
  const [applications, setApplications] = useState<HostApplication[]>(hostApplications);

  const decide = (id: string, status: ApprovalStatus) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)));
  };

  return (
    <>
      <h1 className="page-title">Αιτήσεις Host</h1>
      <p className="page-subtitle">
        Χειροκίνητη έγκριση διοργανωτριών. Η έγκριση δεν ενεργοποιεί από μόνη της paid events.
      </p>

      <table>
        <thead>
          <tr>
            <th>Αιτούσα</th>
            <th>Πόλη</th>
            <th>Προτεινόμενα events</th>
            <th>Πληρωμές</th>
            <th>Κατάσταση</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>
                <div className="person">
                  <div className="avatar" />
                  <div>
                    <div className="person-name">{application.name}</div>
                    <div className="person-meta">{application.email}</div>
                  </div>
                </div>
              </td>
              <td>{application.city}</td>
              <td style={{ maxWidth: 260 }}>{application.proposedEvents}</td>
              <td>
                {application.paymentVerified ? (
                  <span className="badge badge-approved">
                    <Check size={11} /> Συνδεδεμένος
                  </span>
                ) : (
                  <span className="badge badge-pending">
                    <CircleDashed size={11} /> Εκκρεμεί
                  </span>
                )}
              </td>
              <td>
                <span className={`badge badge-${application.status}`}>
                  {STATUS_LABELS[application.status]}
                </span>
              </td>
              <td>
                {application.status === 'pending' ? (
                  <div className="row-actions">
                    <button className="btn btn-ghost" onClick={() => decide(application.id, 'rejected')}>
                      <X size={12} /> Απόρριψη
                    </button>
                    <button className="btn btn-primary" onClick={() => decide(application.id, 'approved')}>
                      Έγκριση
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
