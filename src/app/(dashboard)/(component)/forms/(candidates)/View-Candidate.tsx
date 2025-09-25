'use client'
import React, { useState, useMemo, useCallback } from "react";
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
  Image as ImageIcon,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  SortAsc,
  SortDesc,
  MoreHorizontal,
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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "" | "ascending" | "descending" }>({ key: "", direction: "" });
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

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
    if ((["id", "surname", "firstName", "otherName", "email", "phoneNumber", "dateOfBirth", "gender", "state", "lga", "nin", "disability", "registrationDate", "status", "examScore", "profilePhoto"] as string[]).includes(sortConfig.key)) {
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
        return "text-green-600 bg-green-50 border-green-200";
      case "Pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Inactive":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Candidates Management
              </h1>
              <p className="text-gray-600 mt-1">
                View, manage, and export candidate information
              </p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <Plus className="w-4 h-4" />
              Add New Candidate
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {candidates.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {candidates.filter((c) => c.status === "Active").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {candidates.filter((c) => c.status === "Pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    candidates
                      .filter((c) => c.examScore !== null)
                      .reduce((acc, c) => acc + (c.examScore ?? 0), 0) /
                      (candidates.filter((c) => c.examScore !== null).length || 1)
                  ) || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
                  showFilters
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
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
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 top-12 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-48">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          exportToCSV();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          exportToPDF();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                      </button>
                      <button
                        onClick={() => {
                          exportToExcel();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export as Excel
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          exportToCSV(paginatedCandidates);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded text-blue-600"
                      >
                        Export Current Page
                      </button>
                      {selectedCandidates.length > 0 && (
                        <button
                          onClick={() => {
                            exportToCSV();
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded text-green-600"
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
            <div className="p-4 bg-gray-50 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
                <p className="text-sm text-gray-600">
                  Showing {sortedCandidates.length} of {candidates.length}{" "}
                  candidates
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
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
                      className="rounded border-gray-300"
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
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={(e) =>
                          handleSelectCandidate(candidate.id, e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {candidate.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {`${candidate.surname} ${candidate.firstName} ${candidate.otherName || ""}`.trim()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {candidate.gender}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {candidate.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {candidate.phoneNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
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
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {candidate.examScore ? (
                        <span
                          className={`font-medium ${candidate.examScore >= 80 ? "text-green-600" : candidate.examScore >= 60 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {candidate.examScore}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
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
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedCandidates.length)} of{" "}
              {sortedCandidates.length} candidates
            </p>
          </div>
        </div>

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Candidate Details</h2>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {`${selectedCandidate.surname} ${selectedCandidate.firstName} ${selectedCandidate.otherName || ""}`.trim()}
                      </h3>
                      <p className="text-gray-600">{selectedCandidate.id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(selectedCandidate.status)}`}
                        >
                          {getStatusIcon(selectedCandidate.status)}
                          {selectedCandidate.status}
                        </span>
                        {selectedCandidate.examScore && (
                          <span className="text-sm text-gray-600">
                            Score:{" "}
                            <span
                              className={`font-medium ${selectedCandidate.examScore >= 80 ? "text-green-600" : selectedCandidate.examScore >= 60 ? "text-yellow-600" : "text-red-600"}`}
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
                      <h4 className="font-medium text-gray-900 border-b pb-2">
                        Personal Information
                      </h4>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="font-medium">
                            {selectedCandidate.dateOfBirth}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium">
                            {selectedCandidate.gender}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">
                            {selectedCandidate.phoneNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">
                            {selectedCandidate.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">NIN:</span>
                          <span className="font-medium">
                            {selectedCandidate.nin}
                          </span>
                        </div>

                        {selectedCandidate.disability && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Disability:</span>
                            <span className="font-medium">
                              {selectedCandidate.disability}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 border-b pb-2">
                        Location & Registration
                      </h4>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">State:</span>
                          <span className="font-medium">
                            {selectedCandidate.state}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">LGA:</span>
                          <span className="font-medium">
                            {selectedCandidate.lga}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Registered:</span>
                          <span className="font-medium">
                            {selectedCandidate.registrationDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => exportToCSV([selectedCandidate])}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      Export Details
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
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
