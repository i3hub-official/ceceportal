import Image from "next/image";
import { UserPlus } from "lucide-react";

export default function RecentActivity() {
  // Sample registration data matching the CEC Okigwe theme
  const registrations = [
    {
      id: 1,
      student: {
        name: "Chinwe Okoro",
        dob: "2015-03-12",
        gender: "Female",
        avatar:
          "https://ui-avatars.com/api/?name=Chinwe+Okoro&background=10b981&color=fff&size=40",
        school: "St. Mary's Primary School",
      },
      time: "2 hours ago",
      status: "Completed",
    },
    {
      id: 2,
      student: {
        name: "Emeka Nwankwo",
        dob: "2014-11-05",
        gender: "Male",
        avatar:
          "https://ui-avatars.com/api/?name=Emeka+Nwankwo&background=06b6d4&color=fff&size=40",
        school: "Holy Trinity Secondary School",
      },
      time: "Yesterday",
      status: "Completed",
    },
    {
      id: 3,
      student: {
        name: "Adaobi Eze",
        dob: "2016-07-22",
        gender: "Female",
        avatar:
          "https://ui-avatars.com/api/?name=Adaobi+Eze&background=f59e0b&color=fff&size=40",
        school: "St. Joseph's College",
      },
      time: "2 days ago",
      status: "Pending",
    },
    {
      id: 4,
      student: {
        name: "Chukwudi Onyema",
        dob: "2015-09-14",
        gender: "Male",
        avatar:
          "https://ui-avatars.com/api/?name=Chukwudi+Onyema&background=3b82f6&color=fff&size=40",
        school: "Sacred Heart Academy",
      },
      time: "3 days ago",
      status: "Completed",
    },
    {
      id: 5,
      student: {
        name: "Ngozi Adeyemi",
        dob: "2014-12-08",
        gender: "Female",
        avatar:
          "https://ui-avatars.com/api/?name=Ngozi+Adeyemi&background=8b5cf6&color=fff&size=40",
        school: "St. Peter's Academy",
      },
      time: "4 days ago",
      status: "Pending",
    },
  ];

  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary-10 rounded-lg">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Recent Registration
          </h3>
          <p className="text-sm text-muted-foreground">
            Latest candidates added to the system
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-6 max-h-96 overflow-y-auto pr-2">
        {registrations.map((registration) => (
          <div
            key={registration.id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted-10 dark:hover:bg-muted-20 transition-colors duration-150"
          >
            <div className="flex-shrink-0 relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
                <Image
                  src={registration.student.avatar}
                  alt={registration.student.name}
                  width={40}
                  height={40}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                  registration.status === "Completed"
                    ? "bg-success"
                    : "bg-warning"
                }`}
              >
                {registration.status === "Completed" ? (
                  <svg
                    className="w-2 h-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-2 h-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-foreground font-medium">
                  New Student Registration
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    registration.status === "Completed"
                      ? "bg-success-10 text-success dark:bg-success-20 dark:text-success-80"
                      : "bg-warning-10 text-warning dark:bg-warning-20 dark:text-warning-80"
                  }`}
                >
                  {registration.status}
                </span>
              </div>

              <div className="mt-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-foreground">
                    {registration.student.name}
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {registration.student.gender}
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    DOB:{" "}
                    {new Date(registration.student.dob).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {registration.student.school}
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                {registration.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
