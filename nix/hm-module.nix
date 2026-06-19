{ config, lib, pkgs, ... }:

let
  cfg = config.services.easypdfnex;
in
{
  options.services.easypdfnex = {
    enable = lib.mkEnableOption "easypdfnex - Professional PDF Tools";

    package = lib.mkOption {
      type = lib.types.package;
      default = pkgs.easypdfnex;
      defaultText = lib.literalExpression "pkgs.easypdfnex";
      description = "The easypdfnex package to use.";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3000;
      description = "Port to listen on.";
    };
  };

  config = lib.mkIf cfg.enable {
    nixpkgs.overlays = [
      (final: prev: {
        easypdfnex = final.callPackage ./package.nix { };
      })
    ];

    systemd.user.services.easypdfnex = {
      Unit = {
        Description = "easypdfnex PDF Tools";
        After = [ "network.target" ];
      };

      Service = {
        ExecStart = "${cfg.package}/bin/easypdfnex";
        Restart = "on-failure";
        Environment = [
          "easypdfnex_PORT=${toString cfg.port}"
        ];
      };

      Install = {
        WantedBy = [ "default.target" ];
      };
    };
  };
}
