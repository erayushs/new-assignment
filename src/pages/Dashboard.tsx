import locationIcon from "../../public/location.svg";
import bellIcon from "../../public/bell.svg";
import voucherIcon from "../../public/coupon.png";
import walletIcon from "../../public/wallet.svg";
import diamondIcon from "../../public/diamond.svg";
import scannerIcon from "../../public/scanner.svg";
import rightArrowIcon from "../../public/rightArrowIcon.png";
import profileIcon from "../../public/profile.png";
import thunderIcon from "../../public/thunder.png";
import archiveIcon from "../../public/archive.png";
import deliveryIcon from "../../public/delivery.png";
import trackIcon from "../../public/map.png";
import homeIcon from "../../public/home.svg";
import activity from "../../public/activity.png";
import message from "../../public/message.png";
import account from "../../public/account.png";

const Dashboard = () => {
  return (
    <div className="flex w-screen items-center justify-center bg-gray-100 overflow-hidden">
      <div className="lg:w-[500px] w-full bg-white p-2 relative">
        <div className="w-full h-[100px] fixed bottom-0 left-1/2 transform -translate-x-1/2 lg:w-[500px] bg-white">
          <div className="flex p-4 justify-around">
            <div className="">
              <div className="w-[50px] h-[50px] rounded-md">
                <img src={homeIcon} alt="" className="w-full p-2" />
              </div>
              <p className="text-sm text-gray-600 text-center pt-2">Home</p>
            </div>
            <div className="">
              <div className="w-[50px] h-[50px] rounded-md p-[10px]">
                <img src={activity} alt="" />
              </div>
              <p className="text-sm text-gray-600 text-center pt-2">Activity</p>
            </div>
            <div className="">
              <div className="w-[50px] h-[50px] rounded-md p-[10px]">
                <img src={message} alt="" />
              </div>
              <p className="text-sm text-gray-600 text-center pt-2">Help</p>
            </div>
            <div className="">
              <div className="w-[50px] h-[50px] rounded-md p-[4px]">
                <img src={account} alt="" />
              </div>
              <p className="text-sm text-gray-600 text-center pt-2">Account</p>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-4 p-2 px-4 flex justify-between items-center">
            <div className="flex">
              <div className="w-[50px] h-[50px] rounded-full">
                <img src={profileIcon} alt="profileIcon" />
              </div>
              <div className="ml-4 justify-self-start mt-1">
                <p className="text-sm text-gray-400">My Location</p>
                <p className="text-md flex">
                  <img
                    src={locationIcon}
                    alt="location"
                    className="w-[15px] mr-1"
                  />{" "}
                  <span className="font-semibold">Ireland, </span> Dublin 24
                </p>
              </div>
            </div>

            <img
              src={bellIcon}
              alt="bellIcon"
              className="w-[30px] mb-2 cursor-pointer"
            ></img>
          </div>

          <div className="border border-gray-300 w-[90%] rounded-2xl h-[120px] mx-auto mt-4">
            <div className="flex gap-2 justify-center p-2">
              <div className="border-gray-300 border-r-2 w-[24%] h-[60px]">
                <div className=" w-[40px] h-[40px] mx-auto mt-3">
                  <img src={scannerIcon} alt="scannerIcon" />
                </div>
              </div>
              <div className="border-gray-300 border-r-2 w-[40%] h-[60px] pt-1">
                <div className="flex flex-col justify-center ml-2 gap-0.5">
                  <p className="text-sm text-gray-400 flex">
                    <img
                      src={walletIcon}
                      alt="walletIcon"
                      className="mr-1 w-[15px]"
                    />{" "}
                    My Balance
                  </p>
                  <p className="text-xl">$121,98</p>
                </div>
              </div>
              <div className="border-gray-300 w-[40%] h-[60px]">
                <div className="flex flex-col justify-center ml-2 gap-0.5 pt-1 ">
                  <p className="text-sm text-gray-400 flex">
                    <img
                      src={diamondIcon}
                      alt="walletIcon"
                      className="mr-1 w-[15px]"
                    />{" "}
                    My Coins
                  </p>
                  <p className="text-xl">1,295</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-300"> </div>

            <div className="flex justify-between items-center">
              <p className="p-2 pl-6 flex">
                <img
                  src={voucherIcon}
                  alt="voucher"
                  className="w-[25px] mr-3"
                />
                7 Vouchers Available
              </p>
              <img
                src={rightArrowIcon}
                alt="right arrow"
                className="w-[15px] mr-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4">
          <h3 className="text-lg font-bold">Our Service</h3>
          <div className="flex justify-between mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="border border-amber-400 w-[70px] h-[70px] bg-amber-50 rounded-full">
                <img src={thunderIcon} alt="thunderIcon" className="p-5" />
              </div>
              <p className="text-sm text-gray-400">Express</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="border border-green-400 w-[70px] h-[70px] bg-green-100 rounded-full">
                <img src={archiveIcon} alt="archiveIcon" className="p-4" />
              </div>
              <p className="text-sm text-gray-400">Regular</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="border border-blue-400 w-[70px] h-[70px] bg-blue-100 rounded-full">
                <img src={deliveryIcon} alt="deliveryIcon" className="p-4" />
              </div>
              <p className="text-sm text-gray-400">Cargo</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="border border-amber-400 w-[70px] h-[70px] bg-amber-50 rounded-full">
                <img src={trackIcon} alt="trackIcon" className="p-5" />
              </div>
              <p className="text-sm text-gray-400">Tracking</p>
            </div>
          </div>

          <div className="bg-amber-200 rounded-2xl h-[120px] mx-auto mt-6">
            <div className="p-5 flex flex-col justify-center text-white pl-8">
              <h2 className="text-xl text-white font-bold ">
                Get Discounts Up To 40%
              </h2>
              <p className="text-md text-gray-100">
                Save your money with our discounts.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between">
              <h3 className="text-lg font-bold">My Package</h3>
              <h3 className="text-md text-purple-400 font-semibold cursor-pointer">
                See All
              </h3>
            </div>

            <div className="mt-4 flex flex-col gap-4 pb-20">
              <div className="w-[95%] bg-gray-100 h-[65px] mx-auto rounded-2xl p-4">
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div className=" w-[35px] h-[35px]">
                      <img
                        src={thunderIcon}
                        alt="thunderIcon"
                        className="bg-white rounded p-1"
                      />
                    </div>
                    <div className="text-sm">
                      <h4 className="-mt-0.5">Express Service</h4>
                      <p className="text-slate-400">USA, New York</p>
                    </div>
                  </div>

                  <div className="text-[15px] text-right">
                    <h1 className="-mt-1">est. Aug 25</h1>
                    <p className="text-slate-400">Pyotr Kodzhebash</p>
                  </div>
                </div>
              </div>
              <div className="w-[95%] bg-gray-100 h-[65px] mx-auto rounded-2xl p-4">
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div className=" w-[35px] h-[35px] ">
                      <img
                        src={archiveIcon}
                        alt="archiveIcon"
                        className="bg-white rounded p-1"
                      />
                    </div>
                    <div className="text-sm">
                      <h4 className="-mt-0.5">Regular Service</h4>
                      <p className="text-slate-400">USA, New York</p>
                    </div>
                  </div>

                  <div className="text-[15px] text-right">
                    <h1 className="-mt-1">est. Aug 25</h1>
                    <p className="text-slate-400">Pyotr Kodzhebash</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
