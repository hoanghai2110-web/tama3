"use client";

import { useFormStatus } from "react-dom";
import { LoaderIcon } from "@/components/custom/icons";
import { Button } from "../ui/button";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <>
      <Button
        type={pending ? "button" : "submit"}
        aria-disabled={pending}
        className={`relative ${pending ? "btn-pending" : "btn-submit"}`}
      >
        {children}
        {pending && (
          <span className="animate-spin absolute right-4">
            <LoaderIcon />
          </span>
        )}
        <span aria-live="polite" className="sr-only" role="status">
          {pending ? "Loading" : "Submit form"}
        </span>
      </Button>

      <style jsx>{`
        .btn-submit {
          background-color: #007bff; /* Màu xanh dương */
          color: white;
          padding: 0.75rem 1.25rem;
          font-weight: bold;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .btn-submit:hover {
          background-color: #0056b3; /* Màu xanh đậm khi hover */
        }

        .btn-pending {
          background-color: #6c757d; /* Màu xám khi đang xử lý */
          color: white;
          padding: 0.75rem 1.25rem;
          font-weight: bold;
          border-radius: 4px;
          cursor: not-allowed;
        }

        .btn-pending:hover {
          background-color: #6c757d; /* Không thay đổi khi hover */
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
