import { useState } from "react";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminDeposits() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const { toast } = useToast();
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/deposits', { page, status, search }],
  });
  
  const { mutate: handleAction, isPending } = useMutation({
    mutationFn: async ({ depositId, action, note }: { depositId: number; action: string; note: string }) => {
      const res = await apiRequest("POST", `/api/admin/deposits/${depositId}/${action}`, { note });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsOpen(false);
      setAdminNote("");
      toast({
        title: actionType === "approve" ? "Deposit approved" : "Deposit rejected",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: `Failed to ${actionType} deposit`,
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });
  
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  const openModal = (deposit: any, action: "approve" | "reject") => {
    setSelectedDeposit(deposit);
    setActionType(action);
    setIsOpen(true);
  };
  
  const confirmAction = () => {
    if (!selectedDeposit || !actionType) return;
    handleAction({
      depositId: selectedDeposit.id,
      action: actionType,
      note: adminNote,
    });
  };
  
  const handleViewReceipt = (deposit: any) => {
    window.open(`/api/user/deposits/${deposit.id}/receipt`, '_blank');
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Deposit Management</h1>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Deposit Management</h1>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs value={status} onValueChange={handleStatusChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
          <Input
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.deposits?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No deposits found
                  </TableCell>
                </TableRow>
              ) : (
                data?.deposits?.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      <div className="font-medium">{deposit.username}</div>
                      <div className="text-sm text-gray-500">{deposit.fullName}</div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(deposit.amount)}</TableCell>
                    <TableCell>{formatDate(deposit.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewReceipt(deposit)}
                      >
                        View Receipt
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      {deposit.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openModal(deposit, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openModal(deposit, "reject")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {deposit.status !== "pending" && (
                        <div className="text-sm text-gray-500">
                          {deposit.adminNote || "No notes"}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {data?.pagination && data.pagination.pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                disabled={page === 1}
              />
            </PaginationItem>
            
            {[...Array(data.pagination.pages)].map((_, i) => {
              const pageNum = i + 1;
              // Only show current page and 1 page before and after
              if (
                pageNum === 1 ||
                pageNum === data.pagination.pages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Show ellipsis for skipped pages
              if (pageNum === page - 2 || pageNum === page + 2) {
                return (
                  <PaginationItem key={i}>
                    <span className="px-4 py-2">...</span>
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(page < data.pagination.pages ? page + 1 : page)}
                disabled={page >= data.pagination.pages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Deposit" : "Reject Deposit"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will approve the deposit and activate the user's reward program."
                : "This will reject the deposit and notify the user."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">User</p>
                  <p>{selectedDeposit.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p>{formatCurrency(selectedDeposit.amount)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Admin Note</p>
                <Textarea
                  placeholder="Add a note (optional)"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={isPending}
            >
              {isPending ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
