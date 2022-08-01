import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { BN } from "bn.js";
import { assert } from "chai";
import { DemoPda } from "../target/types/demo_pda";

describe("demo-pda", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DemoPda as Program<DemoPda>;

  it("Is initialized!", async () => {
    const publicKey = anchor.AnchorProvider.local().wallet.publicKey;
    const toWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const [escrowPDA] = await anchor.web3.PublicKey.findProgramAddress([
        utf8.encode('escrow'),
        publicKey.toBuffer(), 
        toWallet.publicKey.toBuffer()
      ],
      program.programId
    );
    console.log("escrowPDA", escrowPDA);
    await program.methods.createEscrow(new BN(32)).accounts({
      from: publicKey,
      to: toWallet.publicKey,
      systemProgram:  anchor.web3.SystemProgram.programId,
      escrow: escrowPDA
    }).rpc();
    const escrowAccount = await program.account.escrowAccount.fetch(escrowPDA);
    console.log(escrowAccount);
    assert.equal(escrowAccount.amount.toNumber(), 32);
    assert.isTrue(escrowAccount.from.equals(publicKey));
    assert.isTrue(escrowAccount.to.equals(toWallet.publicKey));
  });
});
