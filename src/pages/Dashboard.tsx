const Dashboard = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100 overflow-hidden">
      <div className="lg:w-[500px] w-full bg-white p-2 h-full relative">
        <div className="border h-[300px]">
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
      </div>
    </div>
  );
};

export default Dashboard;
