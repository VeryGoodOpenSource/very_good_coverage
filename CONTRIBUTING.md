## 🦦 Releasing

1. Go to the **main** branch and ensure it is up to date with the remote:

```bash
git checkout main
git pull
```

2. Run the script that will generate the CHANGELOG for you: 

```bash
sh tool/release_ready.sh <new-version>
```

**Note 💡** : You should follow semantic versioning and bump according to the changes the new version makes.

`<new-version>`: The version of this new extension release, for example: 0.2.1

The release_ready script will:

 - Create a new branch just for this release and checkout to it.
 - Automatically update the CHANGELOG file with the associated changes.

3. Manually remove the *(deps-dev)* scope or other entries of the conventional commits entries in the CHANGELOG
4. Add the changes and commit with the commit message that the *release_ready* script outputted.
5. Raise a Pull Request, the title should be the same as the commit message outputted by the *release_ready* script.
6. When the Pull Request is merged, tag a new release to the commit. When adding the tag ensure:
    - The tag is pointing to the commit that you recently merged.
    - The title of the tag should be v<new-version>
    - The title of the release should be v<new-version>
    - The description should be a raw copy of the CHANGELOG’s file version’s body you recently crafted (without the version header). If in doubt, see the other released tags as an example.
7. After the release is tagged the new changes will be available by the the following syntax:

```yaml
VeryGoodOpenSource/..@v<new-version>
```

Where: 

- `<new-version>`: The version of this new workflow or action, for example: 0.2.1
8. Go to the **main** branch and ensure it is up to date with the remote:

```yaml
git checkout main
git pull
```

9. Retag the major release.

For the Workflow or Action to be updated for those users using the `@<major-version` syntax we will require to retag the major release.

```yaml
sh tool/retag_v<major-version>.sh <new-version>
```

Where: 

- `<major-version>`: Is the major version of the release, for example in 2.16.3 the major version is 2. For more information see the [semantic versioning documentation](https://semver.org/).
- `<new-version>`: The version of this new workflow or action, for example: 0.2.1.


If your change is a breaking change and requires a new major release you should update the name of the retag script and its `v<major-version>` instances.

10. After the retag the new changes will be available by the the following syntax:

```yaml
VeryGoodOpenSource/..@v<major-version>
```

Where: `<major-version>`: Is the major version of the release, for example in 2.16.3 the major version is 2. For more information see the [semantic versioning documentation](https://semver.org/).
