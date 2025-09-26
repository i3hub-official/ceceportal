"use client";
import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  SortAsc,
  SortDesc,
} from "lucide-react";

// Mock candidate data
type Candidate = {
  id: string;
  surname: string;
  firstName: string;
  otherName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  lga: string;
  nin: string;
  disability: string;
  registrationDate: string;
  status: string;
  examScore: number | null;
  profilePhoto: null;
};

const mockCandidates: Candidate[] = [
  {
    id: "CEC-001",
    surname: "Adebayo",
    firstName: "Olumide",
    otherName: "Tunde",
    email: "olumide.adebayo@email.com",
    phoneNumber: "08012345678",
    dateOfBirth: "1995-03-15",
    gender: "Male",
    state: "Lagos",
    lga: "Ikeja",
    nin: "12345678901",
    disability: "",
    registrationDate: "2024-01-15",
    status: "Active",
    examScore: 85,
    profilePhoto: null,
  },
  {
    id: "CEC-002",
    surname: "Okafor",
    firstName: "Chioma",
    otherName: "Grace",
    email: "chioma.okafor@email.com",
    phoneNumber: "08087654321",
    dateOfBirth: "1992-07-22",
    gender: "Female",
    state: "Anambra",
    lga: "Awka North",
    nin: "98765432101",
    disability: "",
    registrationDate: "2024-01-18",
    status: "Active",
    examScore: 92,
    profilePhoto: null,
  },
  {
    id: "CEC-003",
    surname: "Ibrahim",
    firstName: "Amina",
    otherName: "",
    email: "amina.ibrahim@email.com",
    phoneNumber: "08056789012",
    dateOfBirth: "1998-11-08",
    gender: "Female",
    state: "Kano",
    lga: "Fagge",
    nin: "11223344556",
    disability: "Visual",
    registrationDate: "2024-01-20",
    status: "Pending",
    examScore: null,
    profilePhoto: null,
  },
  {
    id: "CEC-004",
    surname: "Eze",
    firstName: "Chukwuemeka",
    otherName: "Paul",
    email: "chukwuemeka.eze@email.com",
    phoneNumber: "08098765432",
    dateOfBirth: "1990-05-12",
    gender: "Male",
    state: "Enugu",
    lga: "Enugu North",
    nin: "55667788990",
    disability: "",
    registrationDate: "2024-01-25",
    status: "Inactive",
    examScore: 78,
    profilePhoto: null,
  },
  {
    id: "CEC-004",
    surname: "Eze",
    firstName: "Chukwuemeka",
    otherName: "Paul",
    email: "chukwuemeka.eze@email.com",
    phoneNumber: "08098765432",
    dateOfBirth: "1990-05-12",
    gender: "Male",
    state: "Enugu",
    lga: "Enugu North",
    nin: "55667788990",
    disability: "",
    registrationDate: "2024-01-25",
    status: "Active",
    examScore: 88,
    profilePhoto: null,
  },
];

const CandidateViewPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "" | "ascending" | "descending";
  }>({ key: "", direction: "" });
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  // Get unique values for filters
  const uniqueStates = [...new Set(candidates.map((c) => c.state))];
  const uniqueStatuses = [...new Set(candidates.map((c) => c.status))];

  // Filter and search candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        searchTerm === "" ||
        candidate.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.otherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || candidate.status === selectedStatus;

      const matchesState =
        selectedState === "All" || candidate.state === selectedState;

      const matchesGender =
        selectedGender === "All" || candidate.gender === selectedGender;

      return matchesSearch && matchesStatus && matchesState && matchesGender;
    });
  }, [candidates, searchTerm, selectedStatus, selectedState, selectedGender]);

  // Sort candidates
  const sortedCandidates = useMemo(() => {
    if (!sortConfig.key) return filteredCandidates;

    // Type guard to ensure sortConfig.key is a valid keyof Candidate
    if (
      (
        [
          "id",
          "surname",
          "firstName",
          "otherName",
          "email",
          "phoneNumber",
          "dateOfBirth",
          "gender",
          "state",
          "lga",
          "nin",
          "disability",
          "registrationDate",
          "status",
          "examScore",
          "profilePhoto",
        ] as string[]
      ).includes(sortConfig.key)
    ) {
      return [...filteredCandidates].sort((a, b) => {
        const key = sortConfig.key as keyof Candidate;
        const aValue = a[key] ?? "";
        const bValue = b[key] ?? "";
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredCandidates;
  }, [filteredCandidates, sortConfig]);

  // Paginate candidates
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCandidates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage);

  // Sort handler
  const handleSort = (key: string) => {
    let direction: "" | "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(paginatedCandidates.map((c) => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    } else {
      setSelectedCandidates(
        selectedCandidates.filter((id) => id !== candidateId)
      );
    }
  };

  // Export functions
  const exportToCSV = (dataToExport: Candidate[] | null = null) => {
    const data =
      dataToExport ||
      (selectedCandidates.length > 0
        ? candidates.filter((c) => selectedCandidates.includes(c.id))
        : sortedCandidates);

    const headers = [
      "Registration ID",
      "Surname",
      "First Name",
      "Other Name",
      "Email",
      "Phone Number",
      "Date of Birth",
      "Gender",
      "State",
      "LGA",
      "NIN",
      "Disability",
      "Registration Date",
      "Status",
      "Exam Score",
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((candidate) =>
        [
          candidate.id,
          candidate.surname,
          candidate.firstName,
          candidate.otherName || "",
          candidate.email,
          candidate.phoneNumber,
          candidate.dateOfBirth,
          candidate.gender,
          candidate.state,
          candidate.lga,
          candidate.nin,
          candidate.disability || "None",
          candidate.registrationDate,
          candidate.status,
          candidate.examScore || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // This would typically use a PDF library like jsPDF
    alert("PDF export functionality would be implemented here");
  };

  const exportToExcel = () => {
    // This would typically use a library like xlsx
    alert("Excel export functionality would be implemented here");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setSelectedState("All");
    setSelectedGender("All");
    setShowFilters(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-success bg-success-10 border-success-20";
      case "Pending":
        return "text-warning bg-warning-10 border-warning-20";
      case "Inactive":
        return "text-error bg-error-10 border-error-20";
      default:
        return "text-muted-foreground bg-muted-10 border-muted-20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-3 h-3" />;
      case "Pending":
        return <Clock className="w-3 h-3" />;
      case "Inactive":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-6 h-6" />
                Candidates Management
              </h1>
              <p className="text-muted-foreground mt-1">
                View, manage, and export candidate information
              </p>
            </div>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Candidate
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">
                  Total Candidates
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {candidates.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active</p>
                <p className="text-2xl font-bold text-success">
                  {candidates.filter((c) => c.status === "Active").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending</p>
                <p className="text-2xl font-bold text-warning">
                  {candidates.filter((c) => c.status === "Pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Score</p>
                <p className="text-2xl font-bold text-accent">
                  {Math.round(
                    candidates
                      .filter((c) => c.examScore !== null)
                      .reduce((acc, c) => acc + (c.examScore ?? 0), 0) /
                      (candidates.filter((c) => c.examScore !== null).length ||
                        1)
                  ) || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="p-4 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
                  showFilters
                    ? "bg-primary-10 border-primary-30 text-primary"
                    : "border-border text-foreground hover:bg-muted-10"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              {/* Export */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-lg z-10 min-w-48">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          exportToCSV();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted-10 rounded flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          exportToPDF();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted-10 rounded flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                      </button>
                      <button
                        onClick={() => {
                          exportToExcel();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted-10 rounded flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export as Excel
                      </button>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => {
                          exportToCSV(paginatedCandidates);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted-10 rounded text-primary"
                      >
                        Export Current Page
                      </button>
                      {selectedCandidates.length > 0 && (
                        <button
                          onClick={() => {
                            exportToCSV();
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted-10 rounded text-success"
                        >
                          Export Selected ({selectedCandidates.length})
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="p-4 bg-muted-10 dark:bg-muted-20 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="All">All Statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="form-select"
                  >
                    <option value="All">All States</option>
                    {uniqueStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Gender</label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="form-select"
                  >
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
                <p className="text-sm text-muted-foreground">
                  Showing {sortedCandidates.length} of {candidates.length}{" "}
                  candidates
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-muted-10 dark:bg-muted-20 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedCandidates.length ===
                          paginatedCandidates.length &&
                        paginatedCandidates.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border"
                    />
                  </th>
                  {[
                    { key: "id", label: "ID" },
                    { key: "fullName", label: "Full Name" },
                    { key: "email", label: "Email" },
                    { key: "phoneNumber", label: "Phone" },
                    { key: "state", label: "State" },
                    { key: "status", label: "Status" },
                    { key: "examScore", label: "Score" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted-10 dark:hover:bg-muted-20"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {sortConfig.key === column.key &&
                          (sortConfig.direction === "ascending" ? (
                            <SortAsc className="w-4 h-4" />
                          ) : (
                            <SortDesc className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-muted-10 dark:hover:bg-muted-20"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={(e) =>
                          handleSelectCandidate(candidate.id, e.target.checked)
                        }
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {candidate.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {`${candidate.surname} ${candidate.firstName} ${candidate.otherName || ""}`.trim()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {candidate.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {candidate.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {candidate.phoneNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {candidate.state}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(candidate.status)}`}
                      >
                        {getStatusIcon(candidate.status)}
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {candidate.examScore ? (
                        <span
                          className={`font-medium ${candidate.examScore >= 80 ? "text-success" : candidate.examScore >= 60 ? "text-warning" : "text-error"}`}
                        >
                          {candidate.examScore}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 text-primary hover:bg-primary-10 rounded"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-success hover:bg-success-10 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-error hover:bg-error-10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="form-select py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-sm btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn btn-sm ${
                        currentPage === page ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedCandidates.length)} of{" "}
              {sortedCandidates.length} candidates
            </p>
          </div>
        </div>

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Candidate Details
                  </h2>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1 hover:bg-muted-10 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {`${selectedCandidate.surname} ${selectedCandidate.firstName} ${selectedCandidate.otherName || ""}`.trim()}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedCandidate.id}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(selectedCandidate.status)}`}
                        >
                          {getStatusIcon(selectedCandidate.status)}
                          {selectedCandidate.status}
                        </span>
                        {selectedCandidate.examScore && (
                          <span className="text-sm text-muted-foreground">
                            Score:{" "}
                            <span
                              className={`font-medium ${selectedCandidate.examScore >= 80 ? "text-success" : selectedCandidate.examScore >= 60 ? "text-warning" : "text-error"}`}
                            >
                              {selectedCandidate.examScore}%
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground border-b border-border pb-2">
                        Personal Information
                      </h4>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Date of Birth:
                          </span>
                          <span className="font-medium text-foreground">
                            {selectedCandidate.dateOfBirth}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Gender:</span>
                          <span className="font-medium text-foreground">
                            {selectedCandidate.gender}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium text-foreground">
                            {selectedCandidate.phoneNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium text-foreground">
                            {selectedCandidate.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">NIN:</span>
                          <span className="font-medium text-foreground">
                            {selectedCandidate.nin}
                          </span>
                        </div>

                        {selectedCandidate.disability && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Disability:
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedCandidate.disability}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground border-b border-border pb-2">
                        Location & Registration
                      </h4>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">State:</span>
                          <span className="font-medium text-foreground">
                            {selectedCandidate.state}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">LGA:</span>
                          <span className="font-medium text-foreground">
                            {selectedCandidate.lga}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Registered:
                          </span>
                          <span className="font-medium text-foreground">
                            {selectedCandidate.registrationDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => exportToCSV([selectedCandidate])}
                      className="btn btn-success flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Details
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Candidate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateViewPage;
