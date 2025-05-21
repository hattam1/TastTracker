import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

export default function AdminWithdrawals() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<"process" | "complete" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const { toast } = useToast();
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/withdrawals', { page, status, search }],
  });
  
  const { mutate: handleAction, isPending } = useMutation({
    mutationFn: async ({ withdrawalId, action, note }: { withdrawalId: number; action: string; note: string }) => {
      const res = await apiRequest("POST", `/api/admin/withdrawals/${withdrawalId}/${action}`, { note });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsOpen(false);
      setAdminNote("");
      
      let actionMessage = "";
      if (actionType === "process") actionMessage = "Withdrawal marked as processing";
      else if (actionType === "complete") actionMessage = "Withdrawal completed";
      else if (actionType === "reject") actionMessage = "Withdrawal rejected";
      
      toast({
        title: actionMessage,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: `Failed to ${actionType} withdrawal`,
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
  
  const openModal = (withdrawal: any, action: "process" | "complete" | "reject") => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setIsOpen(true);
  };
  
  const confirmAction = () => {
    if (!selectedWithdrawal || !actionType) return;
    handleAction({
      withdrawalId: selectedWithdrawal.id,
      action: actionType,
      note: adminNote,
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderActionButtons = (withdrawal: any) => {
    switch (withdrawal.status.toLowerCase()) {
      case 'pending':
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => openModal(withdrawal, "process")}
            >
              Process
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openModal(withdrawal, "reject")}
            >
              Reject
            </Button>
          </div>
        );
      case 'processing':
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => openModal(withdrawal, "complete")}
            >
              Complete
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openModal(withdrawal, "reject")}
            >
              Reject
            </Button>
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-500">
            {withdrawal.adminNote || "No notes"}
          </div>
        );
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Withdrawal Management</h1>
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
      <h1 className="text-2xl font-bold">Withdrawal Management</h1>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs value={status} onValueChange={handleStatusChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
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
                <TableHead>EasyPaisa</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.withdrawals?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No withdrawals found
                  </TableCell>
                </TableRow>
              ) : (
                data?.withdrawals?.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div className="font-medium">{withdrawal.username}</div>
                      <div className="text-sm text-gray-500">{withdrawal.fullName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(withdrawal.amount)}</div>
                      <div className="text-xs text-gray-500">Fee: {formatCurrency(withdrawal.fee)}</div>
                    </TableCell>
                    <TableCell>{withdrawal.easyPaisaNumber}</TableCell>
                    <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell className="text-right">
                      {renderActionButtons(withdrawal)}
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
              {actionType === "process" 
                ? "Process Withdrawal" 
                : actionType === "complete" 
                  ? "Complete Withdrawal" 
                  : "Reject Withdrawal"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "process"
                ? "This will mark the withdrawal as processing. Ensure you are ready to transfer the funds."
                : actionType === "complete"
                  ? "This will mark the withdrawal as completed. Make sure you have already transferred the funds."
                  : "This will reject the withdrawal and return the funds to the user's balance."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">User</p>
                  <p>{selectedWithdrawal.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p>{formatCurrency(selectedWithdrawal.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">EasyPaisa Number</p>
                  <p>{selectedWithdrawal.easyPaisaNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">After Fee</p>
                  <p>{formatCurrency(selectedWithdrawal.amount - selectedWithdrawal.fee)}</p>
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
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={isPending}
            >
              {isPending 
                ? "Processing..." 
                : actionType === "process" 
                  ? "Mark as Processing" 
                  : actionType === "complete" 
                    ? "Mark as Completed" 
                    : "Reject Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
