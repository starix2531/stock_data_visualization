import React from 'react';
import LoginForm from './SigninPart/login';
import RegistrationForm from './SigninPart/Registration';
import { useState } from 'react';
import { AuthProvider } from './SigninPart/index';
const sharedClasses = {
    bgWhite: 'bg-white',
    bgDark: 'dark:bg-zinc-700',
    rounded: 'rounded-lg',
    shadow: 'shadow',
    p4: 'p-4',
    textGreen: 'text-green-500',
    textRed: 'text-red-500',
    flex: 'flex',
    itemsCenter: 'items-center',
    justifyBetween: 'justify-between',
    ml4: 'ml-4',
    mr2: 'mr-2',
    px4: 'px-4',
    py6: 'py-6',
    py2: 'py-2',
    px2: 'px-2',
    py1: 'py-1',
    wFull: 'w-full',
    grid: 'grid',
    gridCols1: 'grid-cols-1',
    gridCols2: 'grid-cols-2',
    gridCols4: 'grid-cols-4',
    gap4: 'gap-4',
    mt6: 'mt-6',
    text2xl: 'text-2xl',
    fontSemiBold: 'font-semibold',
    textLg: 'text-lg',
    textXl: 'text-xl',
    textSm: 'text-sm',
    bgBlue: 'bg-blue-500',
    bgRed: 'bg-red-500',
    bgGreen: 'bg-green-500',
    textWhite: 'text-white',
};

const GrowthComparisonChart = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegistrationVisible, setIsRegistrationVisible] = useState(false);

  const handleLoginCancel = () => {
    setIsLoginVisible(false);
  };

  const handleLogin = (formData) => {
    // Handle login logic here
    console.log('Login form submitted:', formData);
    setIsLoginVisible(false);
  };

  const handleShowRegistration = () => {
    setIsLoginVisible(false);
    setIsRegistrationVisible(true);
  };

  const handleRegistrationCancel = () => {
    setIsRegistrationVisible(false);
  };

  const handleRegistrationSubmit = (formData) => {
    // Handle registration logic here
    console.log('Registration form submitted:', formData);
    setIsRegistrationVisible(false);
  };

  const showLoginModal = () => {
    setIsLoginVisible(true);
  };

  const showRegistrationModal = () => {
    setIsRegistrationVisible(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegistrationVisible(false);
    setIsLoginVisible(true);
  };

    return (
      <AuthProvider>
        <div className={`container mx-auto ${sharedClasses.px4} ${sharedClasses.py6}`}>
            <div className={`flex ${sharedClasses.justifyBetween} ${sharedClasses.itemsCenter} ${sharedClasses.mb6}`}>
                <div className={`flex ${sharedClasses.itemsCenter}`}>
                    <h1 className={`${sharedClasses.text2xl} ${sharedClasses.fontSemiBold}`}>Growth Comparison Chart</h1>
                    <select className={`${sharedClasses.ml4} ${sharedClasses.bgRed} ${sharedClasses.textWhite} ${sharedClasses.px2} ${sharedClasses.py1} ${sharedClasses.rounded}`}>
                        <option value="portfolio1">Portfolio 1</option>
                        <option value="portfolio2">Portfolio 2</option>
                        <option value="portfolio3">Portfolio 3</option>
                    </select>
                </div>
                <div className={`flex ${sharedClasses.itemsCenter}`}>
                    <button className={`${sharedClasses.bgBlue} ${sharedClasses.textWhite} ${sharedClasses.px4} ${sharedClasses.py2} ${sharedClasses.rounded} ${sharedClasses.mr2}`} onClick={showRegistrationModal}>Add Stock</button>
                </div>
            </div>

            <div>
              {isLoginVisible && (
                <LoginForm
                  visible={isLoginVisible}
                  onCancel={handleLoginCancel}
                  onLogin={handleLogin}
                  onRegister={handleShowRegistration}
                />
              )}
              {isRegistrationVisible && (
                <RegistrationForm
                visible={isRegistrationVisible}
                onCancel={handleRegistrationCancel}
                onSubmit={handleRegistrationSubmit}
                onSwitchToLogin={handleSwitchToLogin}
              />
              )}
            </div>

            <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.p4} ${sharedClasses.shadow}`}>
                <img src="https://placehold.co/600x300" alt="Growth Chart" className={sharedClasses.wFull} crossorigin="anonymous" />
            </div>
            <div className={`${sharedClasses.grid} ${sharedClasses.gridCols1} sm:${sharedClasses.gridCols2} lg:${sharedClasses.gridCols4} ${sharedClasses.gap4} ${sharedClasses.mt6}`}>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>Today</h2>
                    <p className={sharedClasses.textSm}>Compared to Yesterday</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textGreen}`}>+2.86%</p>
                </div>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Week</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Week</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textGreen}`}>+1.98%</p>
                </div>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Month</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Month</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textRed}`}>-2.57%</p>
                </div>
                <div className={`${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.p4} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                    <h2 className={`${sharedClasses.fontSemiBold} ${sharedClasses.textLg}`}>This Year</h2>
                    <p className={sharedClasses.textSm}>Compared to Last Year</p>
                    <p className={`${sharedClasses.textXl} ${sharedClasses.fontSemiBold} ${sharedClasses.textGreen}`}>+8.83%</p>
                </div>
            </div>
            <div className={`${sharedClasses.mt6} ${sharedClasses.bgWhite} ${sharedClasses.bgDark} ${sharedClasses.rounded} ${sharedClasses.shadow}`}>
                <table className="w-full">
                    <thead>
                        <tr className={sharedClasses.textLeft}>
                            <th className={sharedClasses.p4}>Name</th>
                            <th className={sharedClasses.p4}>Gain</th>
                            <th className={sharedClasses.p4}>Monthly</th>
                            <th className={sharedClasses.p4}>Yearly</th>
                            <th className={sharedClasses.p4}>Drawdown</th>
                            <th className={sharedClasses.p4}>Equity</th>
                            <th className={sharedClasses.p4}>Chart</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={sharedClasses.p4}>new_test</td>
                            <td className={`${sharedClasses.p4} ${sharedClasses.textGreen}`}>0%</td>
                            <td className={sharedClasses.p4}>2.25%</td>
                            <td className={sharedClasses.p4}>6.7%</td>
                            <td className={sharedClasses.p4}>8.5%</td>
                            <td className={sharedClasses.p4}>$482,342.42</td>
                            <td className={sharedClasses.p4}>No data to display</td>
                        </tr>
                        <tr>
                            <td className={sharedClasses.p4}>Test</td>
                            <td className={`${sharedClasses.p4} ${sharedClasses.textGreen}`}>+8%</td>
                            <td className={sharedClasses.p4}>2.35%</td>
                            <td className={sharedClasses.p4}>6.9%</td>
                            <td className={sharedClasses.p4}>8.3%</td>
                            <td className={sharedClasses.p4}>$482,300.00</td>
                            <td className={sharedClasses.p4}>No data to display</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </AuthProvider>
    );
};

export default GrowthComparisonChart;
