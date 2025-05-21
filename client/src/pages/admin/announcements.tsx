import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const announcementSchema = z.object({
  content: z.string().min(5, "Announcement content must be at least 5 characters"),
  language: z.enum(["en", "ur"]),
  active: z.boolean().default(true),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AdminAnnouncements() {
  const { toast } = useToast();
  
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      content: "",
      language: "en",
      active: true,
    },
  });
  
  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ['/api/admin/announcements'],
  });
  
  const { mutate: createAnnouncement, isPending: isCreating } = useMutation({
    mutationFn: async (data: AnnouncementFormValues) => {
      const res = await apiRequest("POST", "/api/admin/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      form.reset();
      toast({
        title: "Announcement created",
        description: "Your announcement has been created successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create announcement",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });
  
  const { mutate: toggleAnnouncementActive, isPending: isToggling } = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/announcements/${id}/toggle-active`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      toast({
        title: "Announcement status updated",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update announcement",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: AnnouncementFormValues) => {
    createAnnouncement(values);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Announcement Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Announcement Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your announcement message"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be displayed in the banner at the top of the user dashboard.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="en" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              English
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="ur" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Urdu
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Show this announcement immediately
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Announcement"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAnnouncements ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-md"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {announcements?.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No announcements found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {announcements?.map((announcement: any) => (
                      <div
                        key={announcement.id}
                        className="border rounded-md p-4 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={`${
                                announcement.language === "ur"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {announcement.language === "ur" ? "Urdu" : "English"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${
                                announcement.active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {announcement.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAnnouncementActive(announcement.id)}
                            disabled={isToggling}
                          >
                            {announcement.active ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                        <p className={`${announcement.language === "ur" ? "font-sans" : ""}`}>
                          {announcement.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created on {formatDate(announcement.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
