{
  description = "ast-grep rules for Effect TypeScript projects";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            ast-grep
            nodejs_22
            pnpm
          ];

          shellHook = ''
            echo "effect-ast-grep-rules dev shell"
            echo "  ast-grep $(ast-grep --version | awk '{print $2}')"
            echo "  node     $(node --version)"
            echo "  pnpm     $(pnpm --version)"
          '';
        };
      });
}
