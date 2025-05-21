import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate, generateReferralLink, copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ReferralsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: referralStats } = useQuery({
    queryKey: ['/api/user/referrals/stats'],
  });
  
  const { data: referrals, isLoading } = useQuery({
    queryKey: ['/api/user/referrals'],
  });
  
  const handleCopyReferralLink = async () => {
    if (!user) return;
    
    const link = generateReferralLink(user.username);
    const copied = await copyToClipboard(link);
    
    if (copied) {
      toast({
        title: "Referral link copied",
        description: "Share it with your friends to earn rewards",
        variant: "default",
      });
    } else {
      toast({
        title: "Failed to copy link",
        description: "Please try again or copy it manually",
        variant: "destructive",
      });
    }
  };
  
  const referralLink = user ? generateReferralLink(user.username) : "";
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Referral Program</h1>
        <p className="text-gray-500">Invite friends and earn PKR 100 for each referral</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="lg:flex lg:space-x-6">
          <div className="lg:w-2/3 mb-6 lg:mb-0">
            <h2 className="text-lg font-bold mb-4">Your Referral Link</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex">
                <input 
                  type="text" 
                  value={referralLink} 
                  readOnly 
                  className="text-sm text-gray-500 bg-white border border-gray-200 rounded-l-lg px-3 py-3 flex-1 focus:outline-none"
                />
                <button 
                  className="bg-primary-600 text-white px-4 rounded-r-lg hover:bg-primary-700 transition"
                  onClick={handleCopyReferralLink}
                >
                  <span className="hidden sm:inline mr-1">Copy</span>
                  <i className="ri-file-copy-line"></i>
                </button>
              </div>
            </div>

            <h3 className="font-medium text-gray-800 mb-3">Share your link via:</h3>
            <div className="flex space-x-3 mb-6">
              <a 
                href={`https://wa.me/?text=Join TDX and earn weekly profits! Use my referral link: ${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-[#25D366] text-white w-10 h-10 rounded-full hover:opacity-90 transition"
              >
                <i className="ri-whatsapp-line text-xl"></i>
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-[#3b5998] text-white w-10 h-10 rounded-full hover:opacity-90 transition"
              >
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a 
                href={`https://twitter.com/intent/tweet?text=Join TDX and earn weekly profits! Use my referral link: ${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-[#1DA1F2] text-white w-10 h-10 rounded-full hover:opacity-90 transition"
              >
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <button 
                onClick={handleCopyReferralLink}
                className="flex items-center justify-center bg-gray-100 text-gray-700 w-10 h-10 rounded-full hover:bg-gray-200 transition"
              >
                <i className="ri-more-line text-xl"></i>
              </button>
            </div>

            <h3 className="font-medium text-gray-800 mb-3">How it works:</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. Share your unique referral link with friends</p>
              <p>2. When they register using your link, you'll be tracked as the referrer</p>
              <p>3. Once they register, you'll receive PKR 100 bonus in your account</p>
              <p>4. There's no limit to how many friends you can refer!</p>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl p-5 text-white">
              <h3 className="font-bold text-lg mb-2">Referral Stats</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center justify-center w-12 h-12">
                  <i className="ri-user-add-line text-2xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold">{referralStats?.totalReferrals || 0}</div>
                  <div className="text-sm opacity-80">Total Referrals</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex items-center justify-center w-12 h-12">
                  <i className="ri-money-dollar-circle-line text-2xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {referralStats ? formatCurrency(referralStats.totalEarnings) : "PKR 0"}
                  </div>
                  <div className="text-sm opacity-80">Total Earnings</div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="font-medium mb-1">This Month</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold">{referralStats?.monthlyReferrals || 0}</div>
                    <div className="text-xs opacity-80">Referral{referralStats?.monthlyReferrals !== 1 ? "s" : ""}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {referralStats ? formatCurrency(referralStats.monthlyEarnings) : "PKR 0"}
                    </div>
                    <div className="text-xs opacity-80">Earned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold mb-4">Your Referrals</h2>
        
        {isLoading ? (
          <div className="animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 py-3 border-b border-gray-100">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!referrals || referrals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-sm text-gray-500">
                      No referrals found. Share your link to invite friends!
                    </td>
                  </tr>
                ) : (
                  referrals.map((referral) => (
                    <tr key={referral.id}>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full bg-${referral.active ? 'green' : 'gray'}-100 flex items-center justify-center text-${referral.active ? 'green' : 'gray'}-800 font-medium`}>
                            {referral.fullName.split(" ").map(name => name.charAt(0)).join("").toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{referral.fullName}</div>
                            <div className="text-xs text-gray-500">{referral.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(referral.registeredAt)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${referral.active ? 'green' : 'gray'}-100 text-${referral.active ? 'green' : 'gray'}-800`}>
                          {referral.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-success-600">{formatCurrency(referral.bonus)}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
