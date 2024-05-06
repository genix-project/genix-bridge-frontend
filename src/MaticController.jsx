import MetaMaskOnboarding from "@metamask/onboarding";
import React from "react";
import Web3 from "web3";
import BigInt from "big-integer";
import bs58 from "bs58";
import crypto from "crypto";
import { Container } from "react-bootstrap";

const DECIMALS = 8;

const toSatoshi = (x) => {
  let xs = x.toFixed(DECIMALS);
  xs = xs.substr(0, xs.length - DECIMALS - 1) + xs.slice(xs.length - DECIMALS);
  return xs;
};

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const fromSatoshi = (xs) => {
  let integer = xs.slice(0, xs.length - DECIMALS);
  if (integer === "") {
    integer = "0";
  }

  const fractional = xs.slice(xs.length - DECIMALS).padStart(DECIMALS, "0");
  if (BigInt(fractional) >= 50000000) {
    integer = (BigInt(integer) + BigInt("1")).toString();
  }

  return integer === "" ? "0" : numberWithCommas(integer);
};

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest();
}

const isValidDingocoinAddress = (x) => {
  const raw = bs58.decode(x);
  if (raw.length !== 25) {
    return false;
  }
  if (raw[0] !== 0x16 && raw[0] !== 0x1e) {
    return false;
  }
  const checksum = sha256(sha256(raw.slice(0, 21)));
  return raw.slice(21, 25).equals(checksum.slice(0, 4));
};

const AUTHORITY_NODES = [
  {
    location: "mn1.dingocoin.com",
    port: 8443,
    walletAddress: "0x72321c492EAA102C331C0EB64c9E4a72036f2f1d",
  },
  {
    location: "wdingo.triplezen.org",
    port: 8443,
    walletAddress: "0x90c5951c839de0CC80138D7A47a3F1F0eE5828Ba",
  },
  {
    location: "wdingomatic.mysterious-beard-tackles.com",
    port: 8443,
    walletAddress: "0xcceA32dDbd0b8c56904ED5Cf6Bed0260a753b90a",
  },
  {
    location: "mn2.dingocoin.com",
    port: 8443,
    walletAddress: "0xfA3ba79a0266Fd0354547E4807b19bC8Cef0696C",
  },
  {
    location: "mn3.dingocoin.com",
    port: 8443,
    walletAddress: "0x171922Ad1C671AaAB08A2EEFDf1F92cDB78cA6b4",
  },
];
const AUTHORITY_THRESHOLD = 3;
const authorityLink = (x) => {
  return `https://${x.location}:${x.port}`;
};

const CONTRACT_ADDRESS = "0x033babac01c4e3915cf71d24b6bfb58e606fdb80";

const CONTRACT_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "authorityAddresses",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "authorityThreshold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "destination", type: "string" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "burnHistory",
    outputs: [
      { internalType: "string[]", name: "", type: "string[]" },
      { internalType: "uint256[]", name: "", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "addr", type: "address" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    name: "burnHistory",
    outputs: [
      { internalType: "string", name: "", type: "string" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "addrs", type: "address[]" },
      { internalType: "uint256[]", name: "indexes", type: "uint256[]" },
    ],
    name: "burnHistoryMultiple",
    outputs: [
      { internalType: "string[]", name: "", type: "string[]" },
      { internalType: "uint256[]", name: "", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "configurationNonce",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "newAuthorityAddresses",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "newAuthorityThreshold",
        type: "uint256",
      },
      { internalType: "uint256", name: "newMinBurnAmount", type: "uint256" },
      { internalType: "uint8[]", name: "signV", type: "uint8[]" },
      { internalType: "bytes32[]", name: "signR", type: "bytes32[]" },
      { internalType: "bytes32[]", name: "signS", type: "bytes32[]" },
    ],
    name: "configure",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "minBurnAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "depositAddress", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint8[]", name: "signV", type: "uint8[]" },
      { internalType: "bytes32[]", name: "signR", type: "bytes32[]" },
      { internalType: "bytes32[]", name: "signS", type: "bytes32[]" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "addr", type: "address" },
      { internalType: "string", name: "depositAddress", type: "string" },
    ],
    name: "mintHistory",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "mintNonce",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];


function OnboardingButton(props) {
  const [buttonText, setButtonText] = React.useState(
    "Connect MetaMask wallet to convert"
  );
  const [account, setAccount] = React.useState(null);
  const onboarding = React.useRef();

  // React.useEffect(() => {
  //   async function checkNetwork() {
  //     if (window.ethereum) {
  //       const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  //       if (chainId !== '0x13881') { // Mumbai Matic Testnet network ID
  //         if (window.confirm('WARNING: Metamask is not set to Matic Mumbai Testnet network!')) {
  //           try {
  //             await window.ethereum.request({
  //               method: 'wallet_switchEthereumChain',
  //               params: [{ chainId: '0x13881' }],
  //             });
  //             // window.location.reload()
  //           } catch (error) {
  //             console.error(error);
  //           }
  //         }
  //       }
  //     }
  //   }
  //   //check network in initial load and every 5 seconds after
  //   checkNetwork();
  //   const checkChainId = setInterval(async() => {checkNetwork()}, 5*1000);
  //   return () => clearInterval(checkChainId);
  // }, []);

  React.useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  React.useEffect(() => {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      setButtonText("Click here to install MetaMask!");
    }
  }, [account]);

  const onClick = () => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          const acc = Web3.utils.toChecksumAddress(accounts[0]);
          setAccount(acc);
          setButtonText(acc);
          if (props.onAccountChange) {
            props.onAccountChange(acc);
          }
        });
    } else {
      onboarding.current.startOnboarding();
    }
  };

  return (
    <button
      className="button button3"
      disabled={account !== null ? true : false}
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
}

function MaticController() {
  const web3 = new Web3("https://polygon-rpc.com/");
  const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  async function post(link, data) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    return (
      await fetch(link, {
        withCredentials: true,
        method: "POST",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
    ).json();
  }

  const [wallet, setWallet] = React.useState(null);
  const [aliveNodes, setAliveNodes] = React.useState(null);
  const randAuthorityLink = () => {
    const node =
      AUTHORITY_NODES[
      aliveNodes[Math.floor(Math.random() * aliveNodes.length)]
      ];
    return `https://${node.location}:${node.port}`;
  };
  const stableAuthorityLink = () => {
    const node = AUTHORITY_NODES[4];
    return `https://${node.location}:${node.port}`;
  };

  const [mintDepositAddresses, setMintDepositAddresses] = React.useState([]);
  const [hasMintDepositAddress, setHasMintDepositAddress] =
    React.useState(null);
  const [isCreatingMintDepositAddress, setIsCreatingMintDepositAddress] =
    React.useState(false);

  const [burnAmount, setBurnAmount] = React.useState("");
  const [burnDestination, setBurnDestination] = React.useState("");
  const [burnHistory, setBurnHistory] = React.useState(null);

  const [stats, setStats] = React.useState(null);

  const onAccountChange = (selectedWallet) => {
    setWallet(selectedWallet);
  };

  const refresh = async () => {
    const mintBalance = (
      await post(`${randAuthorityLink()}/queryMintBalance`, {
        mintAddress: wallet,
      })
    ).data;
    if (mintBalance !== null && mintBalance !== undefined) {
      setMintDepositAddresses([
        {
          depositAddress: mintBalance.depositAddress,
          unconfirmedAmount: mintBalance.unconfirmedAmount,
          depositedAmount: mintBalance.depositedAmount,
          mintedAmount: mintBalance.mintedAmount,
        },
      ]);
      setHasMintDepositAddress(true);
    } else {
      setMintDepositAddresses([]);
      setHasMintDepositAddress(false);
    }

    if (aliveNodes.length === AUTHORITY_NODES.length) {
      const burnHistories = (
        await Promise.all(
          aliveNodes
            .map((i) => AUTHORITY_NODES[i])
            .map((x, i) =>
              post(`${authorityLink(x)}/queryBurnHistory`, {
                burnAddress: wallet,
              })
            )
        )
      ).map((x) => x.data.burnHistory);
      const maxLength = Math.max(...burnHistories.map((x) => x.length));

      const burnHistory = [];
      for (let i = 0; i < maxLength; i++) {
        burnHistory.push(burnHistories.filter((x) => x.length > 0)[0][i]);
        burnHistory[i].burnIndex = i;
        if (
          burnHistories.filter((x) => x.length > 0).length <
          burnHistories.length
        ) {
          burnHistory[i].status = null;
        } else if (
          burnHistories.filter((x) => x[i].status === null).length > 0
        ) {
          burnHistory[i].status = null;
        } else if (
          burnHistories.filter((x) => x[i].status === "SUBMITTED").length > 0
        ) {
          burnHistory[i].status = "SUBMITTED";
        } else if (
          burnHistories.filter((x) => x[i].status === "APPROVED").length !==
          burnHistories.length
        ) {
          throw new Error("Invalid burn histories");
        } else {
          burnHistory[i].status = "APPROVED";
        }
      }

      burnHistory.reverse();
      setBurnHistory(burnHistory);
    }
  };

  React.useEffect(() => {
    (async () => {
      if (aliveNodes === null) {
        const alive = [];
        for (const i in AUTHORITY_NODES) {
          await post(`${authorityLink(AUTHORITY_NODES[i])}/ping`)
            .then(() => {
              alive.push(parseInt(i));
            })
            .catch(() => { });
        }
        setAliveNodes(alive);
      }
    })();
  });
  
  React.useEffect(() => {
    (async () => {
      if (aliveNodes !== null && stats === null) {
        const stats = (await post(`${stableAuthorityLink()}/stats`)).data;
        stats.totalSupply = await contract.methods.totalSupply().call();
        setStats(stats);
      }
    })();
  }, [aliveNodes, stats]);

  React.useEffect(() => {
    if (wallet !== null && aliveNodes !== null) {
      const refreshLoop = () => {
        refresh();
        setTimeout(refreshLoop, 3000);
      };
      refreshLoop();
    }
  }, [wallet, aliveNodes]);

  const onCreateDepositAddress = async () => {
    if (aliveNodes.length < AUTHORITY_NODES.length) {
      alert(
        "Creating a deposit address requires all authority nodes to be online."
      );
      return;
    }

    setIsCreatingMintDepositAddress(true);
    const generateDepositAddressResponses = await Promise.all(
      AUTHORITY_NODES.map(async (x) => {
        return await post(`${authorityLink(x)}/generateDepositAddress`, {
          mintAddress: wallet,
        });
      })
    );

    const registerMintDepositAddressResponses = await Promise.all(
      AUTHORITY_NODES.map(
        async (x) =>
          (
            await post(`${authorityLink(x)}/registerMintDepositAddress`, {
              mintAddress: wallet,
              generateDepositAddressResponses: generateDepositAddressResponses,
            })
          ).data
      )
    );

    if (
      !registerMintDepositAddressResponses.every(
        (x) =>
          x.depositAddress ===
          registerMintDepositAddressResponses[0].depositAddress
      )
    ) {
      throw new Error("Consensus failure on deposit address");
    }

    await refresh();
    setIsCreatingMintDepositAddress(false);
  };

  const onMint = async (depositAddress) => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x89') { // Mumbai Matic Testnet network ID
         return window.confirm('WARNING: Metamask is not set to Polygon network!')
      }
    }
    const mintTransactionInfos = Array(AUTHORITY_NODES.length).fill(undefined);
    await Promise.all(
      AUTHORITY_NODES.map((x, i) => {
        return post(`${authorityLink(x)}/createMintTransaction`, {
          mintAddress: wallet,
        })
          .then((r) => {
            mintTransactionInfos[i] = r.data;
          })
          .catch(() => { });
      })
    );
    const availableMintTransactionInfos = mintTransactionInfos.filter(
      (x) => x !== undefined
    );
    if (availableMintTransactionInfos.length < AUTHORITY_THRESHOLD) {
      return alert("Failed to collect sufficient signatures for minting.");
    }
    if (
      !availableMintTransactionInfos.every(
        (x) => x.mintAddress === availableMintTransactionInfos[0].mintAddress
      )
    ) {
      return alert("Consensus failure on mint address.");
    }
    if (
      !availableMintTransactionInfos.every(
        (x) => x.nonce === availableMintTransactionInfos[0].nonce
      )
    ) {
      return alert("Consensus failure on mint nonce.");
    }
    if (
      !availableMintTransactionInfos.every(
        (x) => x.depositAddress === depositAddress
      )
    ) {
      return alert("Consensus failure on deposit address.");
    }
    if (
      !availableMintTransactionInfos.every(
        (x) => x.mintAmount === availableMintTransactionInfos[0].mintAmount
      )
    ) {
      return alert("Consensus failure on mint amount.");
    }
    const mintAmount = availableMintTransactionInfos[0].mintAmount;

    const signV = mintTransactionInfos.map((x) =>
      x === undefined ? "0x0" : x.onContractVerification.v
    );
    const signR = mintTransactionInfos.map((x) =>
      x === undefined ? "0x0" : x.onContractVerification.r
    );
    const signS = mintTransactionInfos.map((x) =>
      x === undefined ? "0x0" : x.onContractVerification.s
    );

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: wallet,
          to: CONTRACT_ADDRESS,
          data: contract.methods
            .mint(depositAddress, mintAmount, signV, signR, signS)
            .encodeABI(),
        },
      ],
    });

    await refresh();
  };

  const onBurnDestinationChange = (e) => {
    setBurnDestination(e.target.value.replace(/\s+/, ""));
  };

  const onBurnAmountChange = (e) => {
    if (/^\d*\.?\d{0,8}$/.test(e.target.value)) {
      setBurnAmount(e.target.value);
    }
  };

  const onBurn = async () => {
    if (!isValidDingocoinAddress(burnDestination)) {
      alert("Burn destination is not a valid Dingocoin address!");
      return;
    }

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: wallet,
          to: CONTRACT_ADDRESS,
          data: contract.methods
            .burn(toSatoshi(Number(burnAmount)), burnDestination)
            .encodeABI(),
        },
      ],
    });

    await refresh();
  };

  const onWithdraw = async (burnIndex) => {
    for (const authorityNode of AUTHORITY_NODES) {
      await post(`${authorityLink(authorityNode)}/submitWithdrawal`, {
        burnAddress: wallet,
        burnIndex: burnIndex,
      });
    }

    await refresh();
  };

  return (
    <div>
      <header className="App-header">
        <Container>
          <a
            className="button button1"
            target="_blank"
            rel="noreferrer"
            href="https://dingocoin.com"
          // href="https://pancakeswap.finance/swap?outputCurrency=0x9b208b117B2C4F76C1534B6f006b033220a681A4"
          >
            Buy wDingocoin (MATIC)
          </a>
          <a
            className="button button1"
            target="_blank"
            rel="noreferrer"
            href="https://dingocoin.com"
          >
            wDingocoin (MATIC) Price
          </a>
          <a
            className="button button2"
            target="_blank"
            rel="noreferrer"
            // href="https://dingocoin.com"
            href={`https://polygonscan.com/token/${CONTRACT_ADDRESS}`}
          >
            wDingocoin (MATIC) Contract
          </a>
          <a
            className="button button4"
            target="_blank"
            rel="noreferrer"
            href="https://dingocoin.com"
          >
            Visit Dingocoin
          </a>
          <br />
          <OnboardingButton onAccountChange={onAccountChange} />
        </Container>
      </header>
      <br /> <br />
      {wallet && aliveNodes && (
        <div>
          <section className="section-b">
            <h3>
              Convert{" "}
              <a target="_blank" href="https://dingocoin.com" rel="noreferrer">
                Dingocoin
              </a>{" "}
              → wDingocoin
            </h3>
            {hasMintDepositAddress === null && <div className="loader"></div>}
            {hasMintDepositAddress === false &&
              aliveNodes !== null &&
              aliveNodes.length === AUTHORITY_NODES.length && (
                <div>
                  {!isCreatingMintDepositAddress ? (
                    <p>
                      <button onClick={onCreateDepositAddress}>
                        Create your Dingocoin deposit address
                      </button>
                    </p>
                  ) : (
                    <div className="loader"></div>
                  )}
                </div>
              )}
            {hasMintDepositAddress === false &&
              aliveNodes !== null &&
              aliveNodes.length !== AUTHORITY_NODES.length && (
                <p>
                  <span style={{ color: "red" }}>
                    <b>
                      Temporarily unable to create deposit address: all
                      authority nodes required to be online.
                    </b>
                  </span>
                </p>
              )}
            {hasMintDepositAddress === true && (
              <div>
                <table>
                  <thead>
                    <tr>
                      <th className="long-header">Your deposit address</th>
                      <th className="short-header">Unconfirmed</th>
                      <th className="short-header">Confirmed*</th>
                      <th className="short-header">Minted</th>
                      <th className="short-header">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mintDepositAddresses.map((x) => {
                      return (
                        <tr key={x.depositAddress}>
                          <td className="long-header">{x.depositAddress}</td>
                          <td className="short-header">
                            {fromSatoshi(x.unconfirmedAmount)}
                          </td>
                          <td className="short-header">
                            {fromSatoshi(x.depositedAmount)}
                          </td>
                          <td className="short-header">
                            {fromSatoshi(x.mintedAmount)}
                          </td>
                          <td className="short-header">
                            {BigInt(x.mintedAmount) <
                              BigInt(x.depositedAmount) && (
                                <button onClick={() => onMint(x.depositAddress)}>
                                  Mint balance
                                </button>
                              )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <br />
                <p>(* Deposits require 120 confirmations (about 2 hours).)</p>
                <p>
                  (* The amount here is after a fee deduction of 10 Dingocoins +
                  1% of total deposited amount thereafter)
                </p>
              </div>
            )}
          </section>

          <hr />

          <section className="section-b">
            <h3>
              Convert wDingocoin →{" "}
              <a target="_blank" href="https://dingocoin.com" rel="noreferrer">
                Dingocoin
              </a>
            </h3>
            {aliveNodes !== null &&
              aliveNodes.length !== AUTHORITY_NODES.length && (
                <p>
                  <span style={{ color: "red" }}>
                    <b>
                      Withdrawals temporarily unavailable: all authority nodes
                      required to be online.
                    </b>
                  </span>
                </p>
              )}
            {aliveNodes !== null &&
              aliveNodes.length === AUTHORITY_NODES.length && (
                <div>
                  <p>
                    <span style={{ color: "red" }}>
                      IMPORTANT: Please ensure that you have entered the correct{" "}
                      <b>
                        <u>
                          <a
                            target="_blank"
                            href="https://dingocoin.com"
                            rel="noreferrer"
                          >
                            Dingocoin
                          </a>{" "}
                          MAINNET address
                        </u>
                      </b>{" "}
                      and <b>amount</b>.
                    </span>
                    <br />
                    <span style={{ color: "red" }}>
                      Any incorrect entry is irreversible and will not be
                      refunded.
                    </span>
                  </p>
                  <p>
                    <a
                      target="_blank"
                      href="https://dingocoin.com"
                      rel="noreferrer"
                    >
                      Dingocoin
                    </a>{" "}
                    withdrawal address:{" "}
                    <input
                      className="inputlong"
                      value={burnDestination}
                      onChange={onBurnDestinationChange}
                      placeHolder={"(e.g. DQBx7G4aozdqYFCv2dU4kacaEcPzwg8dkZ)"}
                    ></input>
                  </p>
                  <p>
                    wDingocoins to convert:{" "}
                    <input
                      className="inputshort"
                      value={burnAmount}
                      onChange={onBurnAmountChange}
                      placeHolder="(e.g. 123450.69)"
                    ></input>
                  </p>
                  <p>
                    <button onClick={onBurn}>Authorize and burn</button>
                  </p>
                  {burnHistory === null && <div className="loader"></div>}
                  {burnHistory !== null && burnHistory.length > 0 && (
                    <div>
                      <table>
                        <thead>
                          <tr>
                            <th className="long-header">Withdrawal address</th>
                            <th className="short-header">Burned</th>
                            <th className="short-header">Withdrawal status</th>
                            <th className="short-header">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {burnHistory.map((x) => {
                            return (
                              <tr key={x.burnIndex}>
                                <td className="long-header">
                                  {x.burnDestination}
                                </td>
                                <td className="short-header">
                                  {fromSatoshi(x.burnAmount)}
                                </td>
                                <td className="short-header">
                                  {x.status === null
                                    ? "Not submitted"
                                    : x.status === "SUBMITTED"
                                      ? "Submitted"
                                      : x.status === "APPROVED"
                                        ? "Approved"
                                        : "UNKNOWN"}
                                </td>
                                <td className="short-header">
                                  {x.status !== null ? null : (
                                    <button
                                      onClick={() => onWithdraw(x.burnIndex)}
                                    >
                                      Submit for withdrawal
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <br />
                      <p>
                        <b>
                          (Withdrawals may take <u>up to 24 hours</u> to
                          dispense)
                        </b>
                      </p>
                      <p>
                        (Each withdrawal is subject to a fee of 10 Dingocoins +
                        1% of burned amount thereafter)
                      </p>
                    </div>
                  )}
                </div>
              )}
          </section>
        </div>
      )}

      <hr />
      <section className="section-a">
        <h3>Polygon Custodian Status</h3> <br />
        <h5>
          Status of Authority Nodes: <br /> <br />
          {aliveNodes === null && <div className="loader"></div>}
          <b>
            {aliveNodes &&
              AUTHORITY_NODES.map((x, i) => (
                <span
                  style={{ color: aliveNodes.includes(i) ? "green" : "red" }}
                >
                  [Node {i}: {aliveNodes.includes(i) ? "Up" : "Down"}]{" "}
                </span>
              ))}
          </b>
        </h5>
        {aliveNodes !== null && (
          <p> <br />
            <small>(Nodes not online? Our load protection system was probably triggered
              by too many of your requests. Please try again in a few minutes.)</small>
          </p>
        )}
        {aliveNodes !== null && stats === null && (
          <div className="loader"></div>
        )}
        <br />
        {stats && (
          <div>
            <table>
              <tbody>
                <tr>
                  <td className="long-header">
                    <a
                      target="_blank"
                      href="https://dingocoin.com"
                      rel="noreferrer"
                    >
                      Dingocoin
                    </a>{" "}
                    Holdings
                  </td>
                  <td className="short-header">
                    {fromSatoshi(
                      (
                        BigInt(stats.unconfirmedUtxos.totalChangeBalance) +
                        BigInt(stats.unconfirmedUtxos.totalDepositsBalance)
                      ).toString()
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="long-header">wDingocoin in Circulation</td>
                  <td className="short-header">
                    {fromSatoshi(stats.totalSupply)}
                  </td>
                </tr>
                <br />
                <tr>
                  <td className="long-header">Dingocoin Deposited</td>
                  <td className="short-header">
                    {fromSatoshi(
                      BigInt(
                        stats.unconfirmedDeposits.totalDepositedAmount
                      ).toString()
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="long-header">Dingocoin Withdrawn</td>
                  <td className="short-header">
                    {fromSatoshi(stats.withdrawals.totalApprovedAmount)}
                  </td>
                </tr>
                <tr>
                  <td className="long-header">Dingocoin Pending Withdraw</td>
                  <td className="short-header">
                    {fromSatoshi(
                      (
                        BigInt(stats.withdrawals.totalApprovableAmount) -
                        BigInt(stats.withdrawals.totalApprovedAmount)
                      ).toString()
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            <br />
          </div>
        )}
      </section>
    </div>
  );
}

export default MaticController;
