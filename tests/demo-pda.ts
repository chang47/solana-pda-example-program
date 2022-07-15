import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { BN } from "bn.js";
import { assert } from "chai";
import { DemoPda } from "../target/types/demo_pda";

describe("demo-pda", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DemoPda as Program<DemoPda>;

  it("Is initialized!", async () => {
    const toWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const [escrowPDA] = await anchor.web3.PublicKey.findProgramAddress(
      [utf8.encode('escrow')],
      program.programId
    );
    const provider = anchor.AnchorProvider.local();
    console.log("escrowPDA", escrowPDA);
    try {
      await program.account.escrowAccount.fetch(escrowPDA);
    } catch (err) {
      const tx = await program.methods.createEscrow(new BN(32)).accounts({
        from: provider.wallet.publicKey,
        to: toWallet.publicKey,
        systemProgram:  anchor.web3.SystemProgram.programId,
        escrow: escrowPDA
      }).rpc();
      console.log("Your transaction signature", tx);
      const escrowAccount = await program.account.escrowAccount.fetch(escrowPDA);
      console.log(escrowAccount);
      assert.equal(escrowAccount.amount.toNumber(), 32);
      assert.equal(escrowAccount.from, provider.wallet.publicKey)
      assert.equal(escrowAccount.to, toWallet.publicKey)
    }
  });
});
