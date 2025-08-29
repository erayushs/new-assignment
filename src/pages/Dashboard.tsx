const Dashboard = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100 overflow-hidden">
      <div className="lg:w-[500px] w-full bg-white p-2 h-full relative">
        <div className="w-full  h-[100px] fixed bottom-0 left-1/2 transform -translate-x-1/2 lg:w-[500px] bg-white">
          <div className="flex p-4 justify-around">
            <div className="">
              <div className="w-[50px] h-[50px] border rounded-md"></div>
              <p className="text-sm text-gray-600 text-center pt-2">Home</p>
            </div>
            <div className="">
              <div className="w-[50px] h-[50px] border rounded-md"></div>
              <p className="text-sm text-gray-600 text-center pt-2">Activity</p>
            </div>
            <div className="">
              <div className="w-[50px] h-[50px] border rounded-md"></div>
              <p className="text-sm text-gray-600 text-center pt-2">Help</p>
            </div>
            <div className="">
              <div className="w-[50px] h-[50px] border rounded-md"></div>
              <p className="text-sm text-gray-600 text-center pt-2">Account</p>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-4 p-2 px-4 flex justify-between items-center">
            <div className="flex">
              <div className="w-[50px] h-[50px] border rounded-full"></div>
              <div className="ml-4 justify-self-start mt-1">
                <p className="text-sm text-gray-600">My Location</p>
                <p className="text-md">
                  <span>Ireland,</span> Dublin 24
                </p>
              </div>
            </div>

            <div className="w-[30px] h-[30px] border rounded-full"></div>
          </div>

          <div className="border w-[90%] rounded-2xl h-[100px] mx-auto mt-4"></div>
        </div>

        <div className="mt-6 p-4">
          <h3 className="text-lg font-bold">Our Service</h3>
          <div className="flex justify-between mt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="border border-amber-400 w-[70px] h-[70px] bg-amber-100 rounded-full"></div>
              <p className="text-sm text-gray-400">Express</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="border border-green-400 w-[70px] h-[70px] bg-green-100 rounded-full"></div>
              <p className="text-sm text-gray-400">Regular</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="border border-blue-400 w-[70px] h-[70px] bg-blue-100 rounded-full"></div>
              <p className="text-sm text-gray-400">Cargo</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="border border-amber-400 w-[70px] h-[70px] bg-amber-100 rounded-full"></div>
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
              <h3 className="text-md text-purple-400 font-semi-bold cursor-pointer">
                See All
              </h3>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="w-[95%] border h-[65px] mx-auto rounded-2xl"></div>
              <div className="w-[95%] border h-[65px] mx-auto rounded-2xl"></div>
              <div className="w-[95%] border h-[65px] mx-auto rounded-2xl"></div>
              <div className="w-[95%] border h-[65px] mx-auto rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
