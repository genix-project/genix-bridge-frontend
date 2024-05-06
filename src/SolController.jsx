import React from "react";
import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import BigInt from "big-integer";
import bs58 from "bs58";
import crypto from "crypto";
import { Container } from "react-bootstrap";

const TOKEN_PUB_KEY = new web3.PublicKey(
  "6VYF5jXq6rfq4QRgGMG6co7b1Ev1Lj7KSbHBxfQ9e1L3"
);
const connection = new web3.Connection(
  "https://skilled-cool-county.solana-mainnet.discover.quiknode.pro/e0e83f0817db1d1e9c52f10380c7bd8d002d5ce2/",
  "confirmed"
);

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

function OnboardingButton(props) {
  const [wallet, setWallet] = React.useState(null);
  const [account, setAccount] = React.useState(undefined);

  const onWalletButtonClick = async () => {
    if (props.provider === null) {
      window.open("https://phantom.app/", "_blank");
    } else {
      await props.provider
        .connect()
        .then(async (x) => {
          setWallet(x);
          if (props.onWalletChange) {
            props.onWalletChange(x);
          }

          const accounts = await connection.getTokenAccountsByOwner(
            x.publicKey,
            { mint: TOKEN_PUB_KEY }
          );
          if (accounts.value.length > 0) {
            setAccount(accounts.value[0]);
            props.onAccountChange(accounts.value[0]);
          } else {
            setAccount(null);
            props.onAccountChange(null);
          }
        })
        .catch(console.log);
    }
  };

  const onAccountButtonClick = async () => {
    // Retrieve token account pubkey.
    const accountPubKey = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      TOKEN_PUB_KEY,
      wallet.publicKey
    );

    // Prepare transaction.
    const tx = new web3.Transaction().add(
      splToken.Token.createAssociatedTokenAccountInstruction(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        TOKEN_PUB_KEY,
        accountPubKey,
        wallet.publicKey,
        wallet.publicKey
      )
    );
    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    tx.feePayer = wallet.publicKey;

    // Sign and send.
    const { signature } = await props.provider.signAndSendTransaction(tx);
    await connection.confirmTransaction(signature);

    // Refresh list.
    const accounts = await connection.getTokenAccountsByOwner(
      wallet.publicKey,
      { mint: TOKEN_PUB_KEY }
    );
    if (accounts.value.length > 0) {
      setAccount(accounts.value[0]);
      props.onAccountChange(accounts.value[0]);
    }
  };

  return (
    <div>
      <button
        className="button button3"
        disabled={wallet !== null ? true : false}
        onClick={onWalletButtonClick}
      >
        {props.provider === null
          ? "Click here to install Phantom wallet!"
          : wallet === null
          ? "Connect Phantom wallet to convert"
          : wallet.publicKey.toBase58()}
      </button>
      <br /> <br />
      <p className="warning">
        <small>WARNING:<br />
        SOL's SPL token is currently experiencing some bugs in minting.<br />
        Hence, all mints will be suspended until SOL fixes the bug.<br /> <br />
        Please REFRAIN FROM DEPOSITING YOUR DINGOCOINS.<br /> <br />
        If you have deposited Dingocoins but your wDingocoins did not get minted, please contact us on Discord.
      </small>
      </p>
      {typeof account !== "undefined" && (
        <button
          className="button button3 mb-4"
          disabled={account !== null ? true : false}
          onClick={onAccountButtonClick}
        >
          {account === null
            ? "Create wDingocoin token account to convert"
            : "wDingocoin token account found for wallet"}
        </button>
      )}
    </div>
  );
}

// { location: "n7.dingocoin.com", port: 8443 }, // dead node removed
function SolController() {
  const AUTHORITY_NODES = [
    { location: "n5.dingocoin.com", port: 8443 },
    { location: "n6.dingocoin.com", port: 8443 },
    { location: "n8.dingocoin.com", port: 8443 },
    { location: "n9.dingocoin.com", port: 8443 },
    { location: "n10.dingocoin.com", port: 8443 },
  ];
  const authorityLink = (x) => {
    return `https://${x.location}:${x.port}`;
  };

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

  const [provider, setProvider] = React.useState(null);
  React.useEffect(() => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        setProvider(provider);
      }
    }
  }, []);

  const [wallet, setWallet] = React.useState(null);
  const [account, setAccount] = React.useState(null);

  const [aliveNodes, setAliveNodes] = React.useState(null);
  const randAuthorityLink = () => {
    const node =
      AUTHORITY_NODES[
        aliveNodes[Math.floor(Math.random() * aliveNodes.length)]
      ];
    return `https://${node.location}:${node.port}`;
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
            .catch(() => {});
        }
        setAliveNodes(alive);
      }
    })();
  });

  const [mintDepositAddresses, setMintDepositAddresses] = React.useState([]);
  const [hasMintDepositAddress, setHasMintDepositAddress] =
    React.useState(null);
  const [isCreatingMintDepositAddress, setIsCreatingMintDepositAddress] =
    React.useState(false);

  const [burnAmount, setBurnAmount] = React.useState("");
  const [burnDestination, setBurnDestination] = React.useState("");
  const [burnHistory, setBurnHistory] = React.useState(null);

  const stableAuthorityLink = () => {
    const node = AUTHORITY_NODES[5];
    return `https://${node.location}:${node.port}`;
  };
  const [stats, setStats] = React.useState(null);
  React.useEffect(() => {
    (async () => {
      if (aliveNodes !== null && stats === null && (5 in aliveNodes)) {
        const stats = (await post(`${stableAuthorityLink()}/stats`)).data;
        console.log(stats);
        setStats(stats);
      }
    })();
  }, [aliveNodes, stats]);

  const onWalletChange = async (selectedWallet) => {
    setWallet(selectedWallet.publicKey.toBase58());
  };
  const onAccountChange = async (selectedAccount) => {
    if (selectedAccount !== null) {
      setAccount(selectedAccount.pubkey.toBase58());
    }
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
          approvedAmount: mintBalance.approvedAmount,
        },
      ]);
      setHasMintDepositAddress(true);
    } else {
      setMintDepositAddresses([]);
      setHasMintDepositAddress(false);
    }

    // Retrieve burns from chain.
    let burnHistory = await connection.getSignaturesForAddress(
      new web3.PublicKey(wallet)
    );
    burnHistory = burnHistory.filter(
      (x) =>
        (x.confirmationStatus === "finalized" ||
          x.confirmationStatus === "confirmed") &&
        x.memo !== null
    );
    burnHistory = burnHistory.filter(
      (x) =>
        x.memo.split(" ").length === 2 &&
        x.memo.split(" ")[1].split("|").length === 3
    );
    burnHistory = burnHistory.map((x) => {
      const tokens = x.memo.split(" ")[1].split("|");
      return {
        burnDestination: tokens[1],
        burnAmount: tokens[2],
        burnSignature: x.signature,
      };
    });
    burnHistory = burnHistory.filter(
      (x) => BigInt(x.burnAmount) >= toSatoshi(100000)
    );

    // Retrieve burnHistory records from nodes.
    const burnHistories = (
      await Promise.all(
        aliveNodes
          .map((i) => AUTHORITY_NODES[i])
          .map((x, i) =>
            post(`${authorityLink(x)}/queryBurnHistory`, {
              burnHistory: burnHistory,
            })
          )
      )
    ).map((x) => x.data.burnHistory);

    for (let i = 0; i < burnHistory.length; i++) {
      if (burnHistories.every((x) => x[i].status === "APPROVED")) {
        burnHistory[i].status = "APPROVED";
      } else if (
        burnHistories.every(
          (x) => x[i].status === "APPROVED" || x[i].status === "SUBMITTED"
        )
      ) {
        burnHistory[i].status = "SUBMITTED";
      } else {
        burnHistory[i].status = null;
      }
    }

    setBurnHistory(burnHistory);
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
            .catch(() => {});
        }
        setAliveNodes(alive);
      }
    })();
  });

  React.useEffect(() => {
    if (wallet !== null && account !== null && aliveNodes !== null) {
      const refreshLoop = () => {
        refresh();
        setTimeout(refreshLoop, 10000);
      };
      refreshLoop();
    }
  }, [wallet, account, aliveNodes]);

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

    if (parseFloat(burnAmount) < 100000) {
      alert("Burn amount must be at least 100,000.");
      return;
    }

    // Populate tx details.
    const tx = new web3.Transaction();
    tx.add(
      splToken.Token.createBurnInstruction(
        splToken.TOKEN_PROGRAM_ID,
        TOKEN_PUB_KEY,
        new web3.PublicKey(account),
        new web3.PublicKey(wallet),
        [],
        toSatoshi(parseFloat(burnAmount))
      )
    );
    tx.add(
      new web3.TransactionInstruction({
        keys: [
          {
            pubkey: new web3.PublicKey(wallet),
            isSigner: true,
            isWritable: false,
          },
        ],
        programId: new web3.PublicKey(
          "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
        ),
        data: Buffer.from(
          "BURN|" + burnDestination + "|" + toSatoshi(parseFloat(burnAmount))
        ),
      })
    );
    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    tx.feePayer = new web3.PublicKey(wallet);

    // Sign and send.
    const { signature } = await provider.signAndSendTransaction(tx);
    await connection.confirmTransaction(signature);

    await refresh();
  };

  const onWithdraw = async (burn) => {
    for (const authorityNode of AUTHORITY_NODES) {
      await post(`${authorityLink(authorityNode)}/submitWithdrawal`, {
        burn: burn,
      });
    }

    await refresh();
  };

  return (
    <div className="App">
      <header className="App-header">
        <Container>
          <a
            className="button button2"
            target="_blank"
            rel="noreferrer"
            href={`https://solscan.io/token/${TOKEN_PUB_KEY}`}
          >
            wDingocoin (SOL) SPL Token
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
          <br />
          <OnboardingButton
            provider={provider}
            onWalletChange={onWalletChange}
            onAccountChange={onAccountChange}
          />
        </Container>
      </header>

      {wallet && account && aliveNodes && (
        <div>
          <hr />
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
                      <th className="short-header">Approved</th>
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
                            {fromSatoshi(x.approvedAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="mt-4">
                  <b>
                    Your confirmed balance will be sent automatically to your
                    SOL wallet within 24 hours.
                    <br />
                    Conversions require a confirmed balance of at least 100,000.
                  </b>
                </p>
                <p>
                  (* Deposits require 120 confirmations (about 2 hours).)
                  <br />
                  (* The amount here is after a fee deduction of 1% of total
                  deposited amount)
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
                      placeholder={"(e.g. DQBx7G4aozdqYFCv2dU4kacaEcPzwg8dkZ)"}
                    ></input>
                  </p>
                  <p>
                    wDingocoins to convert:{" "}
                    <input
                      className="inputshort"
                      value={burnAmount}
                      onChange={onBurnAmountChange}
                      placeholder="(e.g. 123450.69)"
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
                                    <button onClick={() => onWithdraw(x)}>
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
                        (Each withdrawal is subject to a fee of 1% of burned
                        amount)
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
        <h3>SOL Custodian Status</h3> <br />
        <h5>
          Status of Authority Nodes: <br /> <br />
          {aliveNodes === null && <div className="loader"></div>}
          <b>
            {aliveNodes &&
              AUTHORITY_NODES.map((x, i) => (
                <span
                  style={{ color: aliveNodes.includes(i) ? "green" : "red" }}
                >
                  [Node {5 + i}: {aliveNodes.includes(i) ? "Up" : "Down"}]{" "}
                </span>
              ))}
          </b>
        </h5>
        {aliveNodes !== null && (
          
          <p><br />
            (Nodes not online? Our load protection system was probably triggered
            by too many of your requests. Please try again in a few minutes.)
          </p>
        )}
        {aliveNodes !== null && stats === null && (
          <div className="loader"></div>
        )}
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
                    {fromSatoshi(stats.confirmedDeposits.totalApprovedAmount)}
                  </td>
                </tr>
                {
                  <tr>
                    <td className="long-header">wDingocoin Pending Mint</td>
                    <td className="short-header">
                      {fromSatoshi(
                        stats.confirmedDeposits.remainingApprovableAmount
                      )}
                    </td>
                  </tr>
                }
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
                    {fromSatoshi(stats.withdrawals.remainingApprovableAmount)}
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

export default SolController;
